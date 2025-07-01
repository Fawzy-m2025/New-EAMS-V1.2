import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Pause, Play, Trash2, User, MapPin, Wrench } from 'lucide-react';
import type { WorkOrder } from "@/types/eams";
import useEmblaCarousel from 'embla-carousel-react';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';
import { glassCardClass } from '@/components/ui/card';

interface WorkOrderCardCarouselProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  setSelectedWorkOrder: (order: WorkOrder | undefined) => void;
  setShowWorkOrderModal: (show: boolean) => void;
  setDrawerWorkOrder: (order: WorkOrder | null) => void;
  setShowDetailDrawer: (show: boolean) => void;
  getPriorityBadgeBg: (priority: string) => string;
  getPriorityBadgeText: (priority: string) => string;
  getPriorityBadgeGlow: (priority: string) => string;
  getStatusBadgeBg: (status: string) => string;
  getStatusBadgeText: (status: string) => string;
  getStatusBadgeGlow: (status: string) => string;
}

const WorkOrderCardCarousel = ({
  workOrders,
  setWorkOrders,
  setSelectedWorkOrder,
  setShowWorkOrderModal,
  setDrawerWorkOrder,
  setShowDetailDrawer,
  getPriorityBadgeBg,
  getPriorityBadgeText,
  getPriorityBadgeGlow,
  getStatusBadgeBg,
  getStatusBadgeText,
  getStatusBadgeGlow
}: WorkOrderCardCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [cardsToShow, setCardsToShow] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const total = workOrders.length;
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  // Embla carousel setup with custom alignment to center the active card
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    align: 'center',
    containScroll: 'trimSnaps',
    startIndex: 0, // Start with no offset to center active card
  });

  // Update activeIndex in response to Embla's select event
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      let currentIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(currentIndex);
    };
    emblaApi.on('select', onSelect);
    setActiveIndex(emblaApi.selectedScrollSnap());
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, total]);

  // Auto-rotation effect (5.5s per card) using Embla API
  useEffect(() => {
    if (!isAutoPlay || !emblaApi) return;
    autoPlayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 5500);
    return () => autoPlayRef.current && clearInterval(autoPlayRef.current);
  }, [isAutoPlay, emblaApi]);

  // Keyboard navigation and accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement && emblaApi) {
        if (event.key === 'ArrowLeft') {
          emblaApi.scrollPrev();
        } else if (event.key === 'ArrowRight') {
          emblaApi.scrollNext();
        } else if (event.key === ' ' || event.key === 'Enter') {
          setIsAutoPlay((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi]);

  // Pause/resume on hover/touch
  const handlePause = useCallback(() => setIsAutoPlay(false), []);
  const handleResume = useCallback(() => setIsAutoPlay(true), []);

  // Responsive cardsToShow - adjusted to show 1 on mobile, 3 on tablet, 5 on desktop
  useEffect(() => {
    const updateCardsToShow = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024) setCardsToShow(5);
      else if (window.innerWidth >= 768) setCardsToShow(3);
      else setCardsToShow(1);
    };
    updateCardsToShow();
    window.addEventListener('resize', updateCardsToShow);
    return () => window.removeEventListener('resize', updateCardsToShow);
  }, []);

  // Auto-advance carousel (handled by Embla effect above)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % total);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) { // Threshold for swipe
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % total);
      } else {
        setActiveIndex((prev) => (prev - 1 + total) % total);
      }
    }
  };

  // Delete handler with confirmation, animation, and persistence to local storage
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      setRemovingId(id);
      setTimeout(() => {
        const updatedWorkOrders = workOrders.filter(wo => wo.id !== id);
        setWorkOrders(updatedWorkOrders);
        // Save updated work orders to local storage to persist across page refreshes
        saveToLocalStorage('workOrders', updatedWorkOrders);
        setRemovingId(null);
      }, 400); // match animation duration
    }
  };

  // Load work orders from local storage on component mount
  useEffect(() => {
    const savedWorkOrders = loadFromLocalStorage('workOrders', workOrders);
    setWorkOrders(savedWorkOrders);
  }, []); // Empty dependency array to run only once on mount


  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Glassmorphism style
  const glassClass = 'glass-card bg-white/10 backdrop-blur-md shadow-lg border border-white/20 transition-all duration-500';

  return (
    <div
      className="relative w-full flex flex-col items-center group overflow-x-hidden"
      aria-label="Work Order Carousel"
      ref={carouselRef}
    >
      <div className="flex items-center justify-between mb-4 w-full">
        <div>
          <h3 className="text-xl font-bold">Work Orders</h3>
          <p className="text-sm text-muted-foreground">Real-time maintenance tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="gap-2"
            aria-label={isAutoPlay ? 'Pause auto-rotation' : 'Resume auto-rotation'}
          >
            {isAutoPlay ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Auto-Play
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                Manual
              </>
            )}
          </Button>
          <Badge className="bg-white/20 text-primary">
            {activeIndex + 1} / {total}
          </Badge>
        </div>
      </div>
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary/10 text-primary rounded-full p-2 shadow hover:bg-primary/20 transition"
        onClick={() => emblaApi && emblaApi.scrollPrev()}
        aria-label="Previous"
      >
        <ChevronRight className="rotate-180" />
      </button>
      <div
        className="w-full px-6 py-8 overflow-hidden"
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Work Order Carousel"
        tabIndex={0}
      >
        <div className="flex gap-x-4 -ml-2 md:-ml-4">
          {workOrders.map((order, idx) => {
            const isActive = idx === activeIndex;
            const isBeforeActive = idx < activeIndex;
            const isRemoving = removingId === order.id;
            const isUrgent = order.priority === 'critical' || order.priority === 'emergency';
            const isVisible = Math.abs(idx - activeIndex) < cardsToShow || (idx - activeIndex + total) % total < cardsToShow;
            return (
              <div
                key={order.id}
                className="px-2 w-[32%] min-w-[320px] max-w-[400px] h-[300px] flex-shrink-0 flex flex-col justify-between"
                aria-label={`Work Order card for ${order.title}`}
                aria-current={isActive ? 'true' : 'false'}
                tabIndex={isActive ? 0 : -1}
                role="group"
                aria-roledescription="slide"
              >
                <div
                  className={
                    `box-border rounded-2xl h-full w-full flex flex-col justify-between transition-all duration-300 ` +
                    (isActive
                      ? `${glassCardClass} text-card-foreground border-2 border-primary/60 shadow-xl ring-1 ring-primary/60`
                      : 'bg-white/5 dark:bg-zinc-900/10 text-card-foreground border border-primary/20 hover:border-primary/40 shadow-md')
                  }
                  onClick={() => { emblaApi && emblaApi.scrollTo(idx); setDrawerWorkOrder(order); setShowDetailDrawer(true); }}
                  style={{
                    cursor: 'pointer',
                    transform: isActive ? 'scale(1.05) scaleY(1.1)' : 'scale(0.98)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
                    boxShadow: isActive ? '0 8px 25px -8px var(--theme-primary, rgba(59, 130, 246, 0.15)), 0 0 20px 5px var(--theme-primary, rgba(59, 130, 246, 0.1))' : '0 4px 10px -4px var(--theme-primary, rgba(59, 130, 246, 0.05))'
                  }}
                >
                  <div className="p-5 relative z-10 flex flex-col h-full">
                    {/* Top Accent Line */}
                    <div
                      className="absolute top-0 left-0 w-full h-1 rounded-t-[20px]"
                      style={{
                        background: 'linear-gradient(90deg, var(--accent, #FFD700), var(--accent, #FFD700)/50)',
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.8s ease-in-out 1.2s',
                        willChange: 'transform',
                      }}
                    ></div>
                    {/* Optional: Floating urgent/new indicator */}
                    {isUrgent && (
                      <span className="absolute -top-3 -right-3 animate-pulse bg-[#FF4B4B]/80 rounded-full w-7 h-7 flex items-center justify-center shadow-lg ring-2 ring-[#FF4B4B]/60 z-20">
                        <ChevronRight className="animate-bounce h-4 w-4 text-white" />
                      </span>
                    )}
                    {/* Header Section: Priority, Status, Due Date */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {/* Priority pill */}
                      <span className={`px-3 py-1 h-5 rounded-full text-[11px] font-bold tracking-[0.2px] shadow-inner border border-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_8px_rgba(255,255,255,0.2)]`} style={{
                        opacity: isActive ? 1 : 0.5,
                        transform: isActive ? 'scale(1)' : 'scale(0.9)',
                        transition: 'opacity 0.6s ease-in-out 0.2s, transform 0.6s cubic-bezier(0.68,-0.55,0.27,1.55) 0.2s, box-shadow 0.3s ease-in-out 0.2s',
                        background: getPriorityBadgeBg(order.priority),
                        color: getPriorityBadgeText(order.priority),
                        boxShadow: isActive ? `inset 0 0 1px rgba(255, 255, 255, 0.5), 0 0 5px ${getPriorityBadgeGlow(order.priority)}` : 'inset 0 0 1px rgba(255, 255, 255, 0.3)',
                        willChange: 'opacity, transform, box-shadow',
                      }}>{order.priority}</span>
                      {/* Status pill */}
                      <span className={`px-3 py-1 h-5 rounded-full text-[11px] font-bold tracking-[0.2px] shadow-inner border border-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_8px_rgba(255,255,255,0.2)]`} style={{
                        opacity: isActive ? 1 : 0.5,
                        transform: isActive ? 'scale(1)' : 'scale(0.9)',
                        transition: 'opacity 0.6s ease-in-out 0.4s, transform 0.6s cubic-bezier(0.68,-0.55,0.27,1.55) 0.4s, box-shadow 0.3s ease-in-out 0.4s',
                        background: getStatusBadgeBg(order.status),
                        color: getStatusBadgeText(order.status),
                        boxShadow: isActive ? `inset 0 0 1px rgba(255, 255, 255, 0.5), 0 0 5px ${getStatusBadgeGlow(order.status)}` : 'inset 0 0 1px rgba(255, 255, 255, 0.3)',
                        willChange: 'opacity, transform, box-shadow',
                      }}>{order.status}</span>
                      <span className="ml-auto text-[12px] text-muted-foreground font-medium" style={{
                        opacity: isActive ? 1 : 0.5,
                        transform: isActive ? 'translateX(0) translateY(0)' : 'translateX(10px) translateY(-5px)',
                        transition: 'opacity 0.8s ease-in-out 0.6s, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.6s',
                        willChange: 'opacity, transform',
                      }}>
                        Due: {order.dueDate}
                      </span>
                    </div>
                    {/* Title Section */}
                    <div className="mb-2" style={{ opacity: isActive ? 1 : 0.3, transform: isActive ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease-in-out 0.3s, transform 0.4s ease-in-out 0.3s' }}>
                      <h4 className="font-bold text-lg leading-tight truncate text-card-foreground" style={{ color: isActive ? undefined : 'var(--theme-primary, #3B82F6)', backdropFilter: 'blur(4px)' }}>{order.title}</h4>
                    </div>
                    {/* Description Section */}
                    <div className="mb-3 flex-grow" style={{ opacity: isActive ? 1 : 0.3, transform: isActive ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease-in-out 0.4s, transform 0.4s ease-in-out 0.4s' }}>
                      <p className="text-sm text-muted-foreground line-clamp-2" style={{ backdropFilter: 'blur(4px)' }}>{order.description}</p>
                    </div>
                    {/* Metadata Section */}
                    <div className="flex flex-col gap-1.5 text-[13px] text-muted-foreground mb-4" style={{
                      opacity: isActive ? 1 : 0.5,
                      transform: isActive ? 'translateY(0)' : 'translateY(5px)',
                      transition: 'opacity 0.6s ease-in-out 1.4s, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 1.4s',
                      willChange: 'opacity, transform',
                    }}>
                      <span className={`flex items-center gap-1.5 group/icon pr-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{
                        color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                        transition: 'color 0.3s ease-in-out',
                        transitionDelay: '1.4s',
                      }}>
                        <User className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                        <span className="transition-colors duration-300" style={{ transitionDelay: '1.4s' }}>{Array.isArray(order.assignedTo) ? order.assignedTo.join(', ') : order.assignedTo}</span>
                      </span>
                      <span className={`flex items-center gap-1.5 group/icon pr-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{
                        color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                        transition: 'color 0.3s ease-in-out',
                        transitionDelay: '1.5s',
                      }}>
                        <MapPin className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                        <span className="transition-colors duration-300" style={{ transitionDelay: '1.5s' }}>{order.location}</span>
                      </span>
                      <span className={`flex items-center gap-1.5 group/icon ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{
                        color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                        transition: 'color 0.3s ease-in-out',
                        transitionDelay: '1.6s',
                      }}>
                        <Wrench className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                        <span className="transition-colors duration-300" style={{ transitionDelay: '1.6s' }}>{order.equipmentName}</span>
                      </span>
                    </div>
                    {/* Action Buttons Section - Styling updated for transparency and theme consistency */}
                    <div className="flex flex-row gap-2 mt-auto justify-center relative" style={{
                      opacity: isActive ? 1 : 0.5,
                      transform: isActive ? 'scale(1)' : 'scale(0.9)',
                      transition: 'opacity 0.6s ease-in-out 1.7s, transform 0.6s cubic-bezier(0.68,-0.55,0.27,1.55) 1.7s',
                      willChange: 'opacity, transform',
                    }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl px-4 py-2 font-bold border border-primary shadow-lg transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] focus:ring-2 focus:ring-accent focus:outline-none active:scale-95 group/action relative overflow-hidden z-10 backdrop-blur-sm text-card-foreground"
                        style={{
                          background: 'var(--accent)/10',
                          color: 'inherit',
                          boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3), 0 0 8px var(--accent)/50, inset 0 0 10px rgba(255,255,255,0.1)' : '0 2px 5px rgba(0,0,0,0.2), inset 0 0 5px rgba(255,255,255,0.05)',
                          transition: 'transform 0.3s cubic-bezier(0.68,-0.55,0.27,1.55), box-shadow 0.3s ease-in-out, background 0.5s ease-in-out, border 0.3s ease-in-out',
                          transitionDelay: '1.7s',
                          willChange: 'transform, box-shadow, border',
                          borderColor: 'hsl(var(--primary))',
                        }}
                        onClick={e => { e.stopPropagation(); setSelectedWorkOrder(order); setShowWorkOrderModal(true); }}
                        aria-label="Edit work order"
                        title="Edit work order details"
                        onMouseDown={(e) => e.currentTarget.style.border = '2px solid var(--accent)'}
                        onMouseUp={(e) => e.currentTarget.style.border = '1px solid hsl(var(--primary))'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '1px solid hsl(var(--primary))'}
                      >
                        <span className="group-hover/action:text-primary transition-colors duration-200 relative z-10" style={{ textShadow: isActive ? '0 0 5px rgba(0,0,0,0.05)' : 'none', transition: 'text-shadow 0.3s ease-in-out', willChange: 'text-shadow' }}>Edit</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-var(--accent)/20 opacity-0 group-hover/action:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover/action:border-var(--accent)/60 group-hover/action:animate-glow transition-all duration-300" style={{ willChange: 'border' }}></div>
                      </Button>
                      <div className="w-px h-full" style={{
                        backgroundColor: 'var(--theme-primary, #3B82F6)',
                        opacity: isActive ? 0.5 : 0.2,
                        transform: isActive ? 'scaleY(1)' : 'scaleY(0.8)',
                        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                        transitionDelay: '1.8s',
                      }}></div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl px-4 py-2 font-bold border border-primary shadow-lg transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] focus:ring-2 focus:ring-primary focus:outline-none active:scale-95 group/action relative overflow-hidden z-10 backdrop-blur-sm text-card-foreground"
                        style={{
                          background: 'var(--primary)/10',
                          color: 'inherit',
                          boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3), 0 0 8px var(--primary)/50, inset 0 0 10px rgba(255,255,255,0.1)' : '0 2px 5px rgba(0,0,0,0.2), inset 0 0 5px rgba(255,255,255,0.05)',
                          transition: 'transform 0.3s cubic-bezier(0.68,-0.55,0.27,1.55), box-shadow 0.3s ease-in-out, background 0.5s ease-in-out, border 0.3s ease-in-out',
                          transitionDelay: '1.7s',
                          willChange: 'transform, box-shadow, border',
                          borderColor: 'hsl(var(--primary))',
                        }}
                        onClick={e => { e.stopPropagation(); setDrawerWorkOrder(order); setShowDetailDrawer(true); }}
                        aria-label="View work order details"
                        title="View detailed information"
                        onMouseDown={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                        onMouseUp={(e) => e.currentTarget.style.border = '1px solid hsl(var(--primary))'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '1px solid hsl(var(--primary))'}
                      >
                        <span className="group-hover/action:text-primary transition-colors duration-200 relative z-10" style={{ textShadow: isActive ? '0 0 5px rgba(0,0,0,0.05)' : 'none', transition: 'text-shadow 0.3s ease-in-out', willChange: 'text-shadow' }}>View</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-var(--primary)/20 opacity-0 group-hover/action:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover/action:border-var(--primary)/60 group-hover/action:animate-glow transition-all duration-300" style={{ willChange: 'border' }}></div>
                      </Button>
                      <div className="w-px h-full" style={{
                        backgroundColor: 'var(--theme-primary, #3B82F6)',
                        opacity: isActive ? 0.5 : 0.2,
                        transform: isActive ? 'scaleY(1)' : 'scaleY(0.8)',
                        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                        transitionDelay: '1.8s',
                      }}></div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl px-4 py-2 font-bold border border-primary shadow-lg transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] focus:ring-2 focus:ring-destructive focus:outline-none active:scale-95 group/action relative overflow-hidden z-10 backdrop-blur-sm text-white"
                        style={{
                          background: 'var(--destructive)/10',
                          color: '#fff',
                          boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3), 0 0 8px var(--destructive)/50, inset 0 0 10px rgba(255,255,255,0.1)' : '0 2px 5px rgba(0,0,0,0.2), inset 0 0 5px rgba(255,255,255,0.05)',
                          transition: 'transform 0.3s cubic-bezier(0.68,-0.55,0.27,1.55), box-shadow 0.3s ease-in-out, background 0.5s ease-in-out, border 0.3s ease-in-out',
                          transitionDelay: '1.9s',
                          willChange: 'transform, box-shadow, border',
                          borderColor: 'hsl(var(--primary))',
                        }}
                        onClick={e => { e.stopPropagation(); handleDelete(order.id); }}
                        aria-label="Delete work order"
                        title="Delete this work order"
                        onMouseDown={(e) => e.currentTarget.style.border = '2px solid var(--destructive)'}
                        onMouseUp={(e) => e.currentTarget.style.border = '1px solid hsl(var(--primary))'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '1px solid hsl(var(--primary))'}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive group-hover/action:text-white transition-colors duration-200 relative z-10" style={{
                          transitionDelay: '1.9s',
                          textShadow: isActive ? '0 0 5px rgba(0,0,0,0.05)' : 'none',
                          transition: 'text-shadow 0.3s ease-in-out',
                          willChange: 'text-shadow'
                        }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-var(--destructive)/20 opacity-0 group-hover/action:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover/action:border-var(--destructive)/60 group-hover/action:animate-glow transition-all duration-300" style={{ willChange: 'border' }}></div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>
        {`
          @keyframes neonGlow {
            from {
              box-shadow: 0 0 8px var(--accent, #FFD700)/80, 0 0 16px var(--accent, #FFD700)/60;
            }
            to {
              box-shadow: 0 0 12px var(--accent, #FFD700)/90, 0 0 20px var(--accent, #FFF066)/70;
            }
          }
          @keyframes glow {
            0% {
              box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
            }
            50% {
              box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
            }
            100% {
              box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
            }
          }
          .animate-glow {
            animation: glow 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary/10 text-primary rounded-full p-2 shadow hover:bg-primary/20 transition"
        onClick={() => emblaApi && emblaApi.scrollNext()}
        aria-label="Next"
      >
        <ChevronRight />
      </button>
      {/* Dots with Enhanced Styling */}
      <div className="flex justify-center gap-2 mt-6 py-2 px-4 bg-white/5 dark:bg-zinc-900/10 rounded-full border border-white/10 shadow-md" aria-label="Work Order slide indicators">
        {workOrders.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-primary w-6 h-2.5 shadow-lg ring-2 ring-primary/40' : 'bg-muted-foreground/30 w-2.5 h-2.5 hover:bg-muted-foreground/50 hover:scale-110'}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : 'false'}
            style={{
              transform: index === activeIndex ? 'scale(1.1)' : 'scale(1)',
              boxShadow: index === activeIndex ? '0 0 8px var(--theme-primary, rgba(59, 130, 246, 0.3))' : 'none',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, background 0.3s ease-in-out, width 0.3s ease-in-out',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkOrderCardCarousel;
