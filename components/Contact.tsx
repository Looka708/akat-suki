'use client'

import { useState } from 'react'

export default function Contact() {
 const [formData, setFormData] = useState({
 email: '',
 inquiryType: '',
 })
 const [errors, setErrors] = useState<{ email?: string; inquiryType?: string }>({})
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

 const validateEmail = (email: string) => {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 return emailRegex.test(email)
 }

 const validateForm = () => {
 const newErrors: { email?: string; inquiryType?: string } = {}

 if (!formData.email) {
 newErrors.email = 'Email is required'
 } else if (!validateEmail(formData.email)) {
 newErrors.email = 'Please enter a valid email address'
 }

 if (!formData.inquiryType) {
 newErrors.inquiryType = 'Please select an inquiry type'
 }

 setErrors(newErrors)
 return Object.keys(newErrors).length === 0
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()

 if (!validateForm()) {
 return
 }

 setIsSubmitting(true)
 setSubmitStatus('idle')

 try {
 // Simulate API call
 await new Promise((resolve) => setTimeout(resolve, 2000))

 // Here you would normally send data to your API
 console.log('Form submitted:', formData)

 setSubmitStatus('success')
 setFormData({ email: '', inquiryType: '' })
 setErrors({})

 // Reset success message after 5 seconds
 setTimeout(() => setSubmitStatus('idle'), 5000)
 } catch (error) {
 console.error('Submission error:', error)
 setSubmitStatus('error')

 // Reset error message after 5 seconds
 setTimeout(() => setSubmitStatus('idle'), 5000)
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target
 setFormData({ ...formData, [name]: value })

 // Clear error for this field when user starts typing
 if (errors[name as keyof typeof errors]) {
 setErrors({ ...errors, [name]: undefined })
 }
 }

 return (
 <section id="contact" className="py-32 relative bg-[#050505]">
 <div className="max-w-2xl mx-auto px-6 text-center relative z-10 glass-panel p-12 rounded-xl border-t border-[#dc143c]/30">
 <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc143c]/10 rounded-full blur-[100px] pointer-events-none"></div>

 <div className="relative z-10">
 <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white ">
 READY TO ASCEND?
 </h2>
 <p className="text-gray-400 mb-12 font-rajdhani text-lg tracking-wide">
 Join the ranks of the elite. Applications are currently open for content creators and
 strategic partners.
 </p>

 <form onSubmit={handleSubmit} className="text-left space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Email Field */}
 <div>
 <label htmlFor="email" className="sr-only">Email Address</label>
 <input
 id="email"
 type="email"
 name="email"
 placeholder="Email Address"
 value={formData.email}
 onChange={handleChange}
 disabled={isSubmitting}
 className={`w-full bg-[#0a0e1a]/80 border py-4 px-4 text-white focus:outline-none transition-all duration-300 placeholder-gray-600 text-sm font-mono disabled:opacity-50 rounded-lg shadow-inner ${errors.email
 ? 'border-red-500 focus:border-red-500 '
 : 'border-[#dc143c]/30 focus:border-[#dc143c] focus:'
 }`}
 aria-invalid={!!errors.email}
 aria-describedby={errors.email ? 'email-error' : undefined}
 />
 {errors.email && (
 <p id="email-error" className="text-red-400 text-xs mt-2 font-mono" role="alert">
 {errors.email}
 </p>
 )}
 </div>

 {/* Inquiry Type Field */}
 <div className="relative">
 <label htmlFor="inquiryType" className="sr-only">Inquiry Type</label>
 <select
 id="inquiryType"
 name="inquiryType"
 value={formData.inquiryType}
 onChange={handleChange}
 disabled={isSubmitting}
 className={`w-full bg-[#0a0e1a]/80 border py-4 px-4 text-sm font-mono appearance-none rounded-lg cursor-pointer disabled:opacity-50 shadow-inner ${formData.inquiryType ? 'text-white' : 'text-gray-500'
 } ${errors.inquiryType
 ? 'border-red-500 focus:border-red-500 '
 : 'border-[#dc143c]/30 focus:border-[#dc143c] focus:'
 } focus:outline-none transition-all duration-300`}
 aria-invalid={!!errors.inquiryType}
 aria-describedby={errors.inquiryType ? 'inquiry-error' : undefined}
 >
 <option value="" disabled>
 Select Inquiry Type
 </option>
 <option value="sponsorship" className="bg-[#0a0e1a] text-white">
 Sponsorship
 </option>
 <option value="recruitment" className="bg-[#0a0e1a] text-white">
 Recruitment
 </option>
 <option value="media" className="bg-[#0a0e1a] text-white">
 Media
 </option>
 <option value="partnership" className="bg-[#0a0e1a] text-white">
 Partnership
 </option>
 <option value="other" className="bg-[#0a0e1a] text-white">
 Other
 </option>
 </select>
 <svg
 className="absolute right-4 top-4 w-5 h-5 text-gray-500 pointer-events-none"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 {errors.inquiryType && (
 <p id="inquiry-error" className="text-red-400 text-xs mt-2 font-mono" role="alert">
 {errors.inquiryType}
 </p>
 )}
 </div>
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isSubmitting}
 className="mt-8 w-full py-5 bg-[#dc143c]/20 border border-[#dc143c]/50 text-[#dc143c] font-bold tracking-[0.2em] hover:bg-[#dc143c] hover:text-[#0a0e1a] hover: transition-all duration-300 rounded-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
 >
 {isSubmitting ? (
 <>
 <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 <span>SUBMITTING...</span>
 </>
 ) : (
 'INITIATE PROTOCOL'
 )}
 </button>

 {/* Status Messages */}
 {submitStatus === 'success' && (
 <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg " role="alert">
 <p className="text-green-400 text-sm text-center font-mono">
 ✓ Message sent successfully! We'll get back to you within 24 hours.
 </p>
 </div>
 )}

 {submitStatus === 'error' && (
 <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg " role="alert">
 <p className="text-red-400 text-sm text-center font-mono">
 ✗ Something went wrong. Please try again later.
 </p>
 </div>
 )}
 </form>
 </div>
 </div>
 </section>
 )
}
