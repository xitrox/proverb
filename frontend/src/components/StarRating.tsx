import { useState } from 'react'

interface StarRatingProps {
  proverbId: string
  averageRating?: number
  totalVotes?: number
  userRating?: number
  onRate: (proverbId: string, rating: number) => Promise<void>
  disabled?: boolean
}

export default function StarRating({
  proverbId,
  averageRating = 0,
  totalVotes = 0,
  userRating,
  onRate,
  disabled = false
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Optimistic UI state
  const [optimisticUserRating, setOptimisticUserRating] = useState<number | undefined>(userRating)
  const [optimisticAverage, setOptimisticAverage] = useState(averageRating)
  const [optimisticVotes, setOptimisticVotes] = useState(totalVotes)

  // Update optimistic state when props change (after server response)
  if (userRating !== optimisticUserRating && !isSubmitting) {
    setOptimisticUserRating(userRating)
  }
  if (averageRating !== optimisticAverage && !isSubmitting) {
    setOptimisticAverage(averageRating)
  }
  if (totalVotes !== optimisticVotes && !isSubmitting) {
    setOptimisticVotes(totalVotes)
  }

  const handleClick = async (rating: number) => {
    if (disabled || isSubmitting) return

    // Optimistic update - show immediately
    const wasFirstVote = optimisticUserRating === undefined
    const oldUserRating = optimisticUserRating
    const oldAverage = optimisticAverage
    const oldVotes = optimisticVotes

    setOptimisticUserRating(rating)

    // Calculate optimistic average
    if (wasFirstVote) {
      // Adding a new vote
      const newTotal = oldVotes + 1
      const newAverage = ((oldAverage * oldVotes) + rating) / newTotal
      setOptimisticAverage(newAverage)
      setOptimisticVotes(newTotal)
    } else if (oldUserRating !== undefined) {
      // Updating existing vote
      const newAverage = ((oldAverage * oldVotes) - oldUserRating + rating) / oldVotes
      setOptimisticAverage(newAverage)
    }

    setIsSubmitting(true)
    try {
      await onRate(proverbId, rating)
      // Success - server will update the real values
    } catch (error) {
      // Rollback on error
      setOptimisticUserRating(oldUserRating)
      setOptimisticAverage(oldAverage)
      setOptimisticVotes(oldVotes)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredRating || optimisticUserRating || optimisticAverage
  const hasVoted = optimisticUserRating !== undefined
  const canInteract = !disabled && !isSubmitting

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {/* Stars */}
        <div
          className="flex gap-1"
          onMouseLeave={() => setHoveredRating(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= displayRating
            const isHoverable = canInteract && !hasVoted

            return (
              <button
                key={star}
                type="button"
                onClick={() => handleClick(star)}
                onMouseEnter={() => isHoverable && setHoveredRating(star)}
                disabled={!canInteract}
                className={`
                  text-2xl transition-all duration-150
                  ${canInteract && !hasVoted ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
                  ${hasVoted ? 'opacity-60' : 'opacity-100'}
                  ${isFilled ? 'text-yellow-500' : 'text-slate-300'}
                  ${isSubmitting ? 'opacity-70' : ''}
                `}
                aria-label={`Rate ${star} stars`}
              >
                {isFilled ? '★' : '☆'}
              </button>
            )
          })}
        </div>

        {/* Rating info */}
        {optimisticVotes > 0 && (
          <div className={`text-sm text-slate-600 transition-opacity duration-200 ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}>
            <span className="font-medium">{optimisticAverage.toFixed(1)}</span>
            <span className="text-slate-500"> ({optimisticVotes} {optimisticVotes === 1 ? 'vote' : 'votes'})</span>
          </div>
        )}
      </div>

      {/* User feedback */}
      {hasVoted && (
        <div className={`text-xs text-slate-500 transition-opacity duration-200 ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}>
          Your rating: {optimisticUserRating} ★
        </div>
      )}
    </div>
  )
}
