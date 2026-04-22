'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'

export function ContactForm() {
  const contact = useAppStore((s) => s.resume?.sections.contactInfo)
  const updateContactInfo = useAppStore((s) => s.updateContactInfo)
  if (!contact) return null
  return (
    <div className="px-4 pt-4">
      <h3 className="sr-only">Contact Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="contact-fullName" className="text-[13px] font-semibold">Full Name</Label>
          <Input id="contact-fullName" value={contact.fullName}
            onChange={(e) => updateContactInfo({ fullName: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="contact-email" className="text-[13px] font-semibold">Email</Label>
          <Input id="contact-email" type="email" value={contact.email}
            onChange={(e) => updateContactInfo({ email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="contact-phone" className="text-[13px] font-semibold">Phone</Label>
          <Input id="contact-phone" value={contact.phone}
            onChange={(e) => updateContactInfo({ phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="contact-location" className="text-[13px] font-semibold">Location</Label>
          <Input id="contact-location" value={contact.location}
            onChange={(e) => updateContactInfo({ location: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="contact-linkedIn" className="text-[13px] font-semibold">LinkedIn</Label>
          <Input id="contact-linkedIn" placeholder="LinkedIn URL (optional)" value={contact.linkedIn ?? ''}
            onChange={(e) => updateContactInfo({ linkedIn: e.target.value || undefined })} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="contact-website" className="text-[13px] font-semibold">Website</Label>
          <Input id="contact-website" placeholder="Website URL (optional)" value={contact.website ?? ''}
            onChange={(e) => updateContactInfo({ website: e.target.value || undefined })} />
        </div>
      </div>
    </div>
  )
}
