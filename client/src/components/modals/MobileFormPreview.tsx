import React from "react";
import { X } from "lucide-react";
import { FaInstagram, FaSnapchat } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Campaign } from "@shared/schema";

type MobileFormPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign;
};

export default function MobileFormPreview({
  isOpen,
  onClose,
  campaign,
}: MobileFormPreviewProps) {
  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        <div className="relative w-full max-w-xs mx-auto">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl transform transition-all max-w-xs w-full">
            <div className="relative h-12 bg-slate-800 flex items-center justify-center">
              <div className="absolute top-1 left-0 right-0 mx-auto w-24 h-5 bg-slate-900 rounded-b-xl"></div>
              <div className="text-white text-xs">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="p-4 bg-white">
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Megaphone />
                </div>
                <h3 className="text-lg font-semibold mt-2">{campaign.title}</h3>
                <p className="text-sm text-slate-600">{campaign.description.length > 60 
                  ? campaign.description.substring(0, 57) + '...' 
                  : campaign.description}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Your Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Your Email</label>
                  <input type="email" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="john@example.com" />
                </div>
                
                <div>
                  <p className="block text-sm font-medium text-slate-700">Share on your social media:</p>
                  <div className="flex space-x-2 mt-2">
                    {campaign.platforms.includes("instagram") && (
                      <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                        <FaInstagram className="mr-1" /> Instagram
                      </Button>
                    )}
                    {campaign.platforms.includes("snapchat") && (
                      <Button variant="outline" className="flex-1 bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500">
                        <FaSnapchat className="mr-1" /> Snapchat
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Upload Screenshot</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 text-white">
                  Submit Entry
                </Button>
              </div>
              
              <div className="mt-6 text-center text-xs text-slate-500">
                <p>Terms and conditions apply. <a href="#" className="text-blue-600">Learn more</a></p>
              </div>
            </div>
            
            <div className="h-10 bg-white border-t border-slate-200 flex justify-center">
              <div className="w-28 h-1 bg-slate-300 rounded-full mt-4"></div>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="absolute -top-12 right-0 text-white hover:text-slate-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Megaphone() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-primary"
    >
      <path d="M3 11h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z"></path>
      <path d="M7 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"></path>
      <path d="M18 8a3 3 0 0 1 0 6"></path>
      <path d="M21 5a6 6 0 0 1 0 12"></path>
      <path d="M15 8a6 6 0 0 1 0 12H7"></path>
    </svg>
  );
}
