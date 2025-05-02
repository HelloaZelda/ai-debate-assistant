"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type RecordingPermissionProps = {
  onPermissionChange?: (granted: boolean) => void
}

export function RecordingPermission({ onPermissionChange }: RecordingPermissionProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt")

  // Check if browser supports the MediaDevices API
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState("unsupported")
      if (onPermissionChange) onPermissionChange(false)
      return
    }

    // Check if permission was already granted
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((permissionStatus) => {
        setPermissionState(permissionStatus.state as "prompt" | "granted" | "denied")
        if (onPermissionChange) onPermissionChange(permissionStatus.state === "granted")

        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state as "prompt" | "granted" | "denied")
          if (onPermissionChange) onPermissionChange(permissionStatus.state === "granted")
        }
      })
      .catch(() => {
        // If permissions API is not supported, we'll handle it when user clicks the button
      })
  }, [onPermissionChange])

  const requestPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setPermissionState("granted")
        if (onPermissionChange) onPermissionChange(true)
      })
      .catch(() => {
        setPermissionState("denied")
        if (onPermissionChange) onPermissionChange(false)
      })
  }

  if (permissionState === "unsupported") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>录音功能不可用</AlertTitle>
        <AlertDescription>
          您的浏览器不支持录音功能。请尝试使用更现代的浏览器，如Chrome、Firefox或Edge。
        </AlertDescription>
      </Alert>
    )
  }

  if (permissionState === "denied") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>麦克风权限被拒绝</AlertTitle>
        <AlertDescription>
          您需要在浏览器设置中允许此网站使用麦克风。请点击地址栏中的锁定图标，然后启用麦克风权限。
        </AlertDescription>
      </Alert>
    )
  }

  if (permissionState === "prompt") {
    return (
      <Button onClick={requestPermission} variant="outline" size="sm">
        <Mic className="mr-2 h-4 w-4" />
        请求录音权限
      </Button>
    )
  }

  return null
}
