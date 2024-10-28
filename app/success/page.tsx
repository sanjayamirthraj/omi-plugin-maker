'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Upload, Mail, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from 'next/link'

export default function Component() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="text-primary w-12 h-12" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Submission Successful!</CardTitle>
            <CardDescription className="text-center">
              Your OMI plugin for the wearable device has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Thank you for submitting your OMI plugin. Our team will review your submission and get back to you shortly.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Upload className="text-blue-500 w-5 h-5 mr-3" />
                <span>Plugin details uploaded and received</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-purple-500 w-5 h-5 mr-3" />
                <span>An email with all of your plugin details has been sent to the team</span>
              </li>
              <li className="flex items-center">
                <Clock className="text-orange-500 w-5 h-5 mr-3" />
                <span>Estimated review time: 2-3 business days</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Return to Plugin Creator</Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}