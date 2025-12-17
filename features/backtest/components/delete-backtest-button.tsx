"use client"

import { Button } from "@/shared/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteBacktest } from "../server/delete-backtest"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface DeleteBacktestButtonProps {
  backtestId: string
}

export function DeleteBacktestButton({ backtestId }: DeleteBacktestButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
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
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="w-4 h-4 mr-2" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  )
}
