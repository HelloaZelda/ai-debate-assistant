"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SettingsDialogProps = {
  isOpen: boolean
  onClose: () => void
  settings: {
    affirmative: string
    negative: string
    openingTime: number
    freeDebateTime: number
    closingTime: number
  }
  onSave: (settings: {
    affirmative: string
    negative: string
    openingTime: number
    freeDebateTime: number
    closingTime: number
  }) => void
}

export function SettingsDialog({ isOpen, onClose, settings, onSave }: SettingsDialogProps) {
  const [formValues, setFormValues] = useState({
    affirmative: settings.affirmative,
    negative: settings.negative,
    openingTime: Math.floor(settings.openingTime / 60),
    freeDebateTime: Math.floor(settings.freeDebateTime / 60),
    closingTime: Math.floor(settings.closingTime / 60),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "affirmative" || name === "negative" ? value : Number.parseInt(value) || 0,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      affirmative: formValues.affirmative,
      negative: formValues.negative,
      openingTime: formValues.openingTime * 60,
      freeDebateTime: formValues.freeDebateTime * 60,
      closingTime: formValues.closingTime * 60,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>辩论设置</DialogTitle>
          <DialogDescription>设置辩论双方名称和各阶段时间</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="affirmative">正方名称</Label>
                <Input id="affirmative" name="affirmative" value={formValues.affirmative} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="negative">反方名称</Label>
                <Input id="negative" name="negative" value={formValues.negative} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingTime">开场陈词时间（分钟）</Label>
              <Input
                id="openingTime"
                name="openingTime"
                type="number"
                min="1"
                value={formValues.openingTime}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeDebateTime">自由辩论时间（分钟）</Label>
              <Input
                id="freeDebateTime"
                name="freeDebateTime"
                type="number"
                min="1"
                value={formValues.freeDebateTime}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime">总结陈词时间（分钟）</Label>
              <Input
                id="closingTime"
                name="closingTime"
                type="number"
                min="1"
                value={formValues.closingTime}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">保存设置</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
