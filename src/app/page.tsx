"use client";

import '@/styles/neo-brutalism.css';
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, Database, Layers3, Lightbulb, Sparkles } from 'lucide-react';
import { useLoader } from '@/context/LoaderContext';

// Enhanced Decorative Elements
function DecorativeElements() {
  const elements = [
    // Top left quadrant
    { top: '5%', left: '5%', size: '20px', delay: '0s', color: 'bg-yellow-300', shape: 'circle', rotation: '0deg' },
    { top: '15%', left: '12%', size: '12px', delay: '0.3s', color: 'bg-purple-400', shape: 'square', rotation: '15deg' },
    { top: '25%', left: '8%', size: '16px', delay: '0.6s', color: 'bg-blue-300', shape: 'plus', rotation: '0deg' },

    // Top right quadrant
    { top: '8%', right: '10%', size: '18px', delay: '0.2s', color: 'bg-pink-300', shape: 'circle', rotation: '0deg' },
    { top: '20%', right: '15%', size: '14px', delay: '0.5s', color: 'bg-green-300', shape: 'square', rotation: '30deg' },
    { top: '15%', right: '25%', size: '10px', delay: '0.8s', color: 'bg-yellow-400', shape: 'plus', rotation: '0deg' },

    // Bottom left quadrant
    { bottom: '15%', left: '10%', size: '16px', delay: '0.4s', color: 'bg-blue-300', shape: 'circle', rotation: '0deg' },
    { bottom: '25%', left: '18%', size: '12px', delay: '0.7s', color: 'bg-purple-300', shape: 'square', rotation: '45deg' },
    { bottom: '10%', left: '25%', size: '14px', delay: '1s', color: 'bg-pink-400', shape: 'plus', rotation: '0deg' },

    // Bottom right quadrant
    { bottom: '8%', right: '12%', size: '20px', delay: '0.3s', color: 'bg-green-400', shape: 'circle', rotation: '0deg' },
    { bottom: '18%', right: '20%', size: '14px', delay: '0.6s', color: 'bg-yellow-300', shape: 'square', rotation: '20deg' },
    { bottom: '25%', right: '8%', size: '12px', delay: '0.9s', color: 'bg-purple-300', shape: 'plus', rotation: '0deg' },
  ];

  return (
    <>
      {elements.map((el, index) => {
        const shapeClass =
          el.shape === 'circle' ? 'rounded-full border-2 border-black' :
          el.shape === 'square' ? 'border-2 border-black' :
          'decorative-cross';

        return (
          <div
            key={index}
            className={`decorative-element ${el.color} ${shapeClass}`}
            style={{
              top: el.top,
              left: el.left,
              right: el.right,
              bottom: el.bottom,
              width: el.size,
              height: el.size,
              animationDelay: el.delay,
              '--rotation': el.rotation,
            } as React.CSSProperties}
          ></div>
        );
      })}
    </>
  );
}

// Enhanced Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  bgColor,
  borderColor = 'border-black',
  textColor = 'text-black',
  link,
  iconBgColor = 'bg-white'
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  bgColor: string;
  borderColor?: string;
  textColor?: string;
  link?: string;
  iconBgColor?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      className={`neo-brutalism-box ${bgColor} ${textColor} p-6 h-full flex flex-col border-4 ${borderColor} rounded-md shadow-[6px_6px_0_0_#000000] transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-3">
        <div className={`relative p-3 ${iconBgColor} rounded-full border-3 border-black inline-block transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <Icon className={`w-8 h-8 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
          {isHovered && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full border border-black animate-ping" />
          )}
        </div>
        <h3 className="text-xl font-bold ml-3 font-sans">{title}</h3>
      </div>
      <p className="text-sm font-sans flex-grow">{description}</p>
    </div>
  );

  return link ? (
    <Link href={link} className="block h-full transform transition-all duration-300 hover:-translate-y-2 hover:translate-x-1">
      {content}
    </Link>
  ) : (
    <div className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:translate-x-1">
      {content}
    </div>
  );
}

// Animated Title Component
function AnimatedTitle({ text, className = '' }: { text: string, className?: string }) {
  return (
    <h1 className={`relative text-5xl md:text-7xl font-black tracking-tight font-display ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block transform transition-transform duration-300 hover:scale-110 hover:-rotate-3 hover:text-purple-600"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

// Animated Button Component
function AnimatedButton({ children, href, className = '' }: { children: React.ReactNode, href: string, className?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className={`relative block w-full max-w-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-md transition-transform duration-300 ease-out"></div>
      <div className={`relative bg-yellow-400 border-4 border-black rounded-md py-6 px-8 font-bold text-xl md:text-2xl text-black flex items-center justify-center space-x-3 transition-all duration-300 ${isHovered ? 'translate-x-1 translate-y-1' : ''}`}>
        <span>{children}</span>
        <ArrowRight className={`w-6 h-6 transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`} />
        {isHovered && (
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-600 animate-spin" />
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  const { startLoading, stopLoading } = useLoader();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent multiple initializations
    if (isLoaded) return;

    // Start the page loading animation
    startLoading('page');

    // Set up content and patterns immediately to avoid flash of unstyled content
    const content = document.getElementById('main-content');
    if (content) {
      content.style.opacity = '0';
    }

    // Random background pattern on page load
    const patterns = ['dots', 'grid', 'lines', 'waves'];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    document.documentElement.setAttribute('data-pattern', randomPattern);

    // Function to complete loading
    const completeLoading = () => {
      if (content) {
        content.classList.add('fade-in-up');
        content.style.opacity = '1';
      }
      setIsLoaded(true);
      stopLoading();
    };

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (!isLoaded) {
        console.log('Safety timeout triggered - forcing loader to hide');
        completeLoading();
      }
    }, 5000);

    // Use window.onload to ensure all resources are loaded
    const handleLoad = () => {
      setTimeout(() => {
        completeLoading();
      }, 500); // Short delay to ensure smooth transition
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(safetyTimeout);
    };
  }, [isLoaded, startLoading, stopLoading]);

  return (
    <main className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center bg-[#F5F0E1] p-4 md:p-8">
      {/* Enhanced Grid Background */}
      <div className="absolute inset-0 z-0 grid-background opacity-30"></div>

      {/* Decorative Elements */}
      <DecorativeElements />

      {/* Main content container */}
      <div
        id="main-content"
        className="relative z-10 flex flex-col items-center justify-between h-full max-w-6xl w-full opacity-0 transition-all duration-1000 ease-out py-8 translate-y-5"
      >
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_0_#000000] rounded-md relative overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-pink-400"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400"></div>

            <AnimatedTitle text="SYNTAX AND SIPS" className="text-4xl md:text-6xl" />

            <p className="text-lg md:text-xl font-medium text-gray-700 mt-4 font-sans relative">
              <span className="relative inline-block">
                Your Daily Dose of AI, ML & Deep Learning Insights
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-purple-400 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </p>
          </div>
        </div>

        {/* Feature Grid - Rearranged for better visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full mb-12">
          <FeatureCard
            icon={BrainCircuit}
            title="Artificial Intelligence"
            description="Exploring the frontiers of intelligent systems and cognitive computing."
            bgColor="bg-purple-300"
            textColor="text-black"
            iconBgColor="bg-white"
          />
          <FeatureCard
            icon={Lightbulb}
            title="Deep Learning"
            description="Delving into neural networks and complex model architectures."
            bgColor="bg-blue-300"
            textColor="text-black"
            iconBgColor="bg-white"
          />
          <FeatureCard
            icon={Layers3}
            title="Machine Learning"
            description="Unveiling patterns and predictions through data-driven algorithms."
            bgColor="bg-pink-300"
            textColor="text-black"
            iconBgColor="bg-white"
          />
        </div>

        {/* Data Science Card and CTA Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          <div className="md:col-span-1">
            <FeatureCard
              icon={Database}
              title="Data Science"
              description="Extracting knowledge and insights from structured and unstructured data."
              bgColor="bg-green-300"
              textColor="text-black"
              iconBgColor="bg-white"
            />
          </div>

          {/* Get Started Button - Centered and more prominent */}
          <div className="md:col-span-2 flex items-center justify-center">
            <AnimatedButton href="/blogs">GET STARTED</AnimatedButton>
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 1.2s ease-out forwards;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-15px) rotate(calc(var(--rotation, 0deg) + 5deg));
          }
        }

        .decorative-element {
          animation: float 8s ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        /* Pattern backgrounds */
        [data-pattern="dots"] .grid-background {
          background-image: radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        [data-pattern="grid"] .grid-background {
          background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        [data-pattern="lines"] .grid-background {
          background-image: linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.03));
          background-size: 30px 30px;
        }

        [data-pattern="waves"] .grid-background {
          background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 50%);
          background-size: 20px 20px;
        }
      `}</style>
    </main>
  );
}
