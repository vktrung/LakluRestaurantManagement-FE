import { ChevronDown, Pencil } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface Permission {
  id: number
  alias: string
  name: string
  description: string | null
}

interface PermissionGroup {
  groupName: string
  groupAlias: string
  groupDescription: string
  permissions: Permission[]
}

interface PermissionGroupProps {
  group: PermissionGroup
  expanded: boolean
  onToggleExpand: () => void
  onEditPermission?: (permission: Permission) => void
}

export function PermissionGroupComponent({
  group,
  expanded,
  onToggleExpand,
  onEditPermission,
}: PermissionGroupProps) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggleExpand} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
        <div>
          <h3 className="text-base font-bold">{group.groupName}</h3>
          <p className="text-sm text-muted-foreground">{group.groupDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{group.permissions.length}</Badge>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "transform rotate-180" : ""}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Separator />
        <div className="p-4 space-y-2">
          {group.permissions.map((permission) => (
            <div key={permission.id} className="flex flex-col gap-1 py-2 border-b last:border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">{permission.name}</h4>
                  <p className="text-xs text-muted-foreground">{permission.alias}</p>
                </div>
                {onEditPermission && (
                  <Button variant="ghost" size="sm" onClick={() => onEditPermission(permission)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Sửa mô tả
                  </Button>
                )}
              </div>
              {permission.description && (
                <div className="mt-1 text-sm bg-muted p-2 rounded-md">
                  {permission.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}