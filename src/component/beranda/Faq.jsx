import React, { useState, useEffect } from 'react'
import { Accordion, AccordionItem } from "@heroui/react"
import { Loader2 } from "lucide-react"

const Faq = () => {
  const [faqs, setFaqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Fetch published FAQs
  const fetchFaqs = async () => {
    try {
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/faqs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        setFaqs(result.data || result || [])
      } else {
        throw new Error('Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      setError('Gagal memuat FAQ')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const displayFaqs = faqs.length > 0 ? faqs : []

  // Show loading state
  if (isLoading) {
    return (
      <section className='px-4 py-12 mx-auto max-w-screen-xl md:py-16 sm:px-6 lg:px-8'>
        {/* Judul section untuk mobile - hanya tampil di mobile */}
        <div className='mb-8 md:hidden'>
          <h2 className='text-3xl font-semibold text-center md:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
        </div>
        
        {/* Konten utama dengan flex layout yang berubah di breakpoint berbeda */}
        <div className='flex flex-col-reverse gap-8 md:flex-row md:gap-12'>
          {/* Bagian loading */}
          <div className='flex flex-col gap-6 justify-center w-full md:w-1/2 md:gap-8'>
            {/* Judul section untuk tablet ke atas - tersembunyi di mobile */}
            <h2 className='hidden text-3xl font-semibold md:block lg:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
            
            {/* Loading indicator */}
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#406386]" />
              <p className="text-gray-600">Memuat FAQ...</p>
            </div>
          </div>

          {/* Bagian gambar */}
          <div className='mb-6 w-full md:w-1/2 md:mb-0'>
            <div className="relative w-full aspect-video md:aspect-auto md:h-full">
              <img 
                src="/assets/image/company-profile/FAQ.png" 
                alt="Siswa sedang belajar bersama" 
                className='object-cover w-full h-full rounded-xl shadow-md' 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className='px-4 py-12 mx-auto max-w-screen-xl md:py-16 sm:px-6 lg:px-8'>
        {/* Judul section untuk mobile - hanya tampil di mobile */}
        <div className='mb-8 md:hidden'>
          <h2 className='text-3xl font-semibold text-center md:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
        </div>
        
        {/* Konten utama dengan flex layout yang berubah di breakpoint berbeda */}
        <div className='flex flex-col-reverse gap-8 md:flex-row md:gap-12'>
          {/* Bagian error */}
          <div className='flex flex-col gap-6 justify-center w-full md:w-1/2 md:gap-8'>
            {/* Judul section untuk tablet ke atas - tersembunyi di mobile */}
            <h2 className='hidden text-3xl font-semibold md:block lg:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
            
            {/* Error message */}
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-8 h-8 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-600 text-center">{error}</p>
              <button 
                onClick={fetchFaqs}
                className="px-4 py-2 text-white bg-[#406386] rounded-lg hover:bg-[#2d4a67] transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>

          {/* Bagian gambar */}
          <div className='mb-6 w-full md:w-1/2 md:mb-0'>
            <div className="relative w-full aspect-video md:aspect-auto md:h-full">
              <img 
                src="/assets/image/company-profile/FAQ.png" 
                alt="Siswa sedang belajar bersama" 
                className='object-cover w-full h-full rounded-xl shadow-md' 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show empty state if no FAQs
  if (displayFaqs.length === 0) {
    return (
      <section className='px-4 py-12 mx-auto max-w-screen-xl md:py-16 sm:px-6 lg:px-8'>
        {/* Judul section untuk mobile - hanya tampil di mobile */}
        <div className='mb-8 md:hidden'>
          <h2 className='text-3xl font-semibold text-center md:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
        </div>
        
        {/* Konten utama dengan flex layout yang berubah di breakpoint berbeda */}
        <div className='flex flex-col-reverse gap-8 md:flex-row md:gap-12'>
          {/* Bagian empty */}
          <div className='flex flex-col gap-6 justify-center w-full md:w-1/2 md:gap-8'>
            {/* Judul section untuk tablet ke atas - tersembunyi di mobile */}
            <h2 className='hidden text-3xl font-semibold md:block lg:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
            
            {/* Empty message */}
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-8 h-8 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-center">Belum ada FAQ yang tersedia saat ini</p>
            </div>
          </div>

          {/* Bagian gambar */}
          <div className='mb-6 w-full md:w-1/2 md:mb-0'>
            <div className="relative w-full aspect-video md:aspect-auto md:h-full">
              <img 
                src="/assets/image/company-profile/FAQ.png" 
                alt="Siswa sedang belajar bersama" 
                className='object-cover w-full h-full rounded-xl shadow-md' 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='px-4 py-12 mx-auto max-w-screen-xl md:py-16 sm:px-6 lg:px-8'>
      {/* Judul section untuk mobile - hanya tampil di mobile */}
      <div className='mb-8 md:hidden'>
        <h2 className='text-3xl font-semibold text-center md:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
      </div>
      
      {/* Konten utama dengan flex layout yang berubah di breakpoint berbeda */}
      <div className='flex flex-col-reverse gap-8 md:flex-row md:gap-12'>
        {/* Bagian accordion/FAQ */}
        <div className='flex flex-col gap-6 justify-center w-full md:w-1/2 md:gap-8'>
          {/* Judul section untuk tablet ke atas - tersembunyi di mobile */}
          <h2 className='hidden text-3xl font-semibold md:block lg:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
          
         
          
          {/* ✅ Dynamic Accordion items */}
          <Accordion variant="splitted" className="w-full">
            {displayFaqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id || index} 
                aria-label={faq.pertanyaan} 
                title={faq.pertanyaan}
              >
                {faq.jawaban}
              </AccordionItem>
            ))}
          </Accordion>
          
         
        </div>

        {/* Bagian gambar */}
        <div className='mb-6 w-full md:w-1/2 md:mb-0'>
          <div className="relative w-full aspect-video md:aspect-auto md:h-full">
            <img 
              src="/assets/image/company-profile/FAQ.png" 
              alt="Siswa sedang belajar bersama" 
              className='object-cover w-full h-full rounded-xl shadow-md' 
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Faq