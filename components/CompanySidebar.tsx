'use client'

import { useState } from 'react'
import {
  Home,
  List,
  FilePlus,
  Users,
  Settings,
  Mail,
  Calendar,
  Wrench,
  FileText,
  MessageSquare,
  Building,
  CreditCard,
  UserCog,
  Bell,
} from 'lucide-react'
import ProfileSidebar from './Profile'

interface Props {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function CompanySidebar({ activeTab, setActiveTab }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const menu = [
    { label: 'Home', key: 'home', icon: <Home size={16} className="mr-2" />, submenu: [] },

    {
      label: 'Properties',
      key: 'properties',
      icon: <Building size={16} className="mr-2" />,
      submenu: [
        { label: 'All Properties', key: 'properties' },
        { label: 'Add Property', key: 'addProperty' },
      ],
    },

    {
      label: 'Listings',
      key: 'listings',
      icon: <FilePlus size={16} className="mr-2" />,
      submenu: [
        { label: 'All Listings', key: 'listings' },
        { label: 'Add Listing', key: 'addListing' },
      ],
    },

    {
      label: 'Tenants',
      key: 'tenants',
      icon: <Users size={16} className="mr-2" />,
      submenu: [
        { label: 'All Tenants', key: 'tenants' },
        { label: 'Add Tenant', key: 'addTenant' },
      ],
    },

    {
      label: 'Appointments',
      key: 'appointments',
      icon: <Calendar size={16} className="mr-2" />,
      submenu: [
        { label: 'Viewing', key: 'appointmentsViewing' },
        { label: 'Meeting', key: 'appointmentsMeeting' },
        { label: 'Maintenance', key: 'appointmentsMaintenance' },
      ],
    },

    {
      label: 'Rent Payments',
      key: 'rentPayments',
      icon: <CreditCard size={16} className="mr-2" />,
      submenu: [
        { label: 'All Payments', key: 'rentPayments' },
        { label: 'Record Payment', key: 'addPayment' },
      ],
    },

    {
      label: 'Legal Documents',
      key: 'legalDocuments',
      icon: <FileText size={16} className="mr-2" />,
      submenu: [
        { label: 'All Documents', key: 'legalDocuments' },
        { label: 'Add Document', key: 'addDocument' },
      ],
    },

    { label: 'Maintenance', key: 'maintenance', icon: <Wrench size={16} className="mr-2" />, submenu: [] },
    { label: 'Leads', key: 'leads', icon: <Mail size={16} className="mr-2" />, submenu: [] },
    { label: 'Chat', key: 'chat', icon: <MessageSquare size={16} className="mr-2" />, submenu: [] },
    { label: 'Team', key: 'team', icon: <UserCog size={16} className="mr-2" />, submenu: [] },
    { label: 'Notifications', key: 'notifications', icon: <Bell size={16} className="mr-2" />, submenu: [] },
    { label: 'Manage Account', key: 'manageAccount', icon: <Settings size={16} className="mr-2" />, submenu: [] },
  ]

  const toggleMenu = (key: string) => setOpenMenu(openMenu === key ? null : key)

  return (
    <aside className="w-64 bg-[#1836b2] text-white shadow flex flex-col">
      

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">

        <ProfileSidebar />
        {menu.map((item) => (
          <div key={item.key}>
            {/* Main menu button */}
            <button
              onClick={() => {
                if (item.submenu.length === 0) {
                  setActiveTab(item.key)
                } else {
                  toggleMenu(item.key)
                }
              }}
              className={`w-full text-left px-4 mt-5 py-2 font-semibold rounded flex items-center 'hover:bg-gray-100 text-black' transition
                ${activeTab === item.key ? 'bg-gray-200 text-black' : ''}
              `}
            >
              {item.icon}
              {item.label}
            </button>

            {/* Submenu */}
            {item.submenu.length > 0 && openMenu === item.key && (
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => setActiveTab(sub.key)}
                    className={`w-full text-left px-3 py-1 rounded text-sm hover:bg-gray-100 text-black transition
                      ${activeTab === sub.key ? 'bg-gray-200 font-bold text-black' : ''}
                    `}
                  >
                    • {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}