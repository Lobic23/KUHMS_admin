import * as React from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { RowsIcon } from '@phosphor-icons/react'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

export const navData = {
  navMain: [
    {
      title: 'Overview',
      url: '/dashboard',
      items: [],
    },
    {
      title: 'Hostel',
      url: '/dashboard/hostel',
      items: [
        { title: 'Rooms & Blocks', url: '/dashboard/hostel/rooms' },
        { title: 'Residents',      url: '/dashboard/hostel/residents' },
        { title: 'Allocations',    url: '/dashboard/hostel/allocations' },
        { title: 'Complaints',     url: '/dashboard/hostel/complaints' },
      ],
    },
    {
      title: 'Canteen',
      url: '/dashboard/canteen',
      items: [
        { title: 'Menu Management', url: '/dashboard/canteen/menu' },
        { title: 'Orders',          url: '/dashboard/canteen/orders' },
        { title: 'Meal Plans',      url: '/dashboard/canteen/meal-plans' },
        { title: 'Inventory',       url: '/dashboard/canteen/inventory' },
      ],
    },
    {
      title: 'Gym',
      url: '/dashboard/gym',
      items: [
        { title: 'Memberships', url: '/dashboard/gym/memberships' },
        { title: 'Equipment',   url: '/dashboard/gym/equipment' },
        { title: 'Trainers',    url: '/dashboard/gym/trainers' },
        { title: 'Schedule',    url: '/dashboard/gym/schedule' },
      ],
    },
    {
      title: 'Users',
      url: '/dashboard/users',
      items: [
        { title: 'All Users',      url: '/dashboard/users/all' },
        { title: 'Staff',          url: '/dashboard/users/staff' },
        { title: 'Access Control', url: '/dashboard/users/access' },
      ],
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useRouter().state.location

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={"/dashboard" as any}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <RowsIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">KUHMS</span>
                  <span className="text-xs">Campus Manager</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navData.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link to={item.url as any} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((sub) => (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton asChild isActive={pathname === sub.url}>
                          <Link to={sub.url as any}>{sub.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}