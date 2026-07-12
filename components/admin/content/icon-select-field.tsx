"use client"

import { resolveLandingIcon, landingIconOptions } from "@/lib/landing-icons"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface IconSelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  allowEmpty?: boolean
  emptyLabel?: string
}

export function IconSelectField({
  label,
  value,
  onChange,
  helperText,
  allowEmpty = false,
  emptyLabel = "Sin icono",
}: IconSelectFieldProps) {
  const CurrentIcon = resolveLandingIcon(value, "BoxIcon")

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>{label}</Label>
        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      </div>

      <Select value={value || "__empty__"} onValueChange={(nextValue) => onChange(nextValue === "__empty__" ? "" : nextValue)}>
        <SelectTrigger className="w-full justify-start">
          <SelectValue>
            <span className="flex items-center gap-2">
              <CurrentIcon className="h-4 w-4" />
              <span>{value || emptyLabel}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty__">{emptyLabel}</SelectItem> : null}
          {landingIconOptions.map((iconName) => {
            const Icon = resolveLandingIcon(iconName, "BoxIcon")

            return (
              <SelectItem key={iconName} value={iconName}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{iconName}</span>
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
