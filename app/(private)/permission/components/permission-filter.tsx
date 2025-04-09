import { Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PermissionFilterProps {
  groups: { groupName: string; groupAlias: string }[]
  selectedGroups: string[]
  onGroupSelectionChange: (groupAlias: string, checked: boolean) => void
}

export function PermissionFilter({ groups, selectedGroups, onGroupSelectionChange }: PermissionFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-9">
          <Filter className="mr-2 h-3.5 w-3.5" />
          Lọc nhóm
          <ChevronDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {groups.map((group) => (
          <DropdownMenuCheckboxItem
            key={group.groupAlias}
            checked={selectedGroups.includes(group.groupAlias)}
            onCheckedChange={(checked) => {
              onGroupSelectionChange(group.groupAlias, !!checked)
            }}
          >
            {group.groupName}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

