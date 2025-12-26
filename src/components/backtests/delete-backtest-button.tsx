"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteBacktest } from "@/server/backtests/delete-backtest"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface DeleteBacktestButtonProps {
  backtestId: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function DeleteBacktestButton({ backtestId, className, variant = "destructive", size = "sm" }: DeleteBacktestButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a link
    e.stopPropagation()
    
    if (confirm("Are you sure you want to delete this backtest?")) {
      startTransition(async () => {
        try {
          await deleteBacktest(backtestId)
          router.push("/backtests")
        } catch (error) {
          console.error("Failed to delete backtest", error)
          alert("Failed to delete backtest")
        }
      })
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleDelete} 
      disabled={isPending}
      className={className}
    >
      <Trash2 className="w-4 h-4" />
      {size !== "icon" && (isPending ? "Deleting..." : "Delete")}
    </Button>
  )
}
