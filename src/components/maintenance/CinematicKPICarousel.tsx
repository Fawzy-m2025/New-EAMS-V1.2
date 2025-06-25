import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious
} from '@/components/ui/carousel';
import {
  Clock, CheckCircle, Target, Users, Brain, Shield, TrendingUp,
  AlertTriangle, Calendar, Wrench, Gauge, Activity, DollarSign
} from 'lucide-react';
import type { WorkOrder } from '@/types/eams';
import useEmblaCarousel from 'embla-carousel-react';
import { glassCardClass } from '@/components/ui/card';

interface CinematicKPICarouselProps {
  workOrders: WorkOrder[];
}

// Unified KPI card type
interface KPICard {
  id: string;
  title: string;
  value: string;
  target?: string;
  trend: { value: number; isPositive: boolean };
  icon: React.ElementType;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  progress?: number;
  unit?: string;
}

// Helper to merge main and enhanced KPIs
function getUnifiedKPICards(workOrders: WorkOrder[]): KPICard[] {
  // Main KPIs (example, can be extended)
  const mainKPIs: KPICard[] = [
    {
      id: 'on-time-completion',
      title: 'On-Time Completion',
      value: '94%',
      trend: { value: 8, isPositive: true },
      icon: CheckCircle,
      status: 'excellent',
      description: 'Performance metric',
      progress: 94,
      unit: '%',
    },
    {
      id: 'otcr',
      title: 'On-Time Completion Rate (OTCR)',
      value: '100.0%',
      trend: { value: 5.2, isPositive: true },
      icon: CheckCircle,
      status: 'excellent',
      description: 'ISO 14224 compliance metric',
      progress: 100,
      unit: '%',
    },
    {
      id: 'mttr',
      title: 'Mean Time to Repair (MTTR)',
      value: '5.2',
      trend: { value: -12, isPositive: false },
      icon: Clock,
      status: 'good',
      description: 'Critical asset responsiveness',
      progress: 0,
      unit: 'hours',
    },
    {
      id: 'backlog',
      title: 'Maintenance Backlog',
      value: '3.2',
      trend: { value: -8, isPositive: false },
      icon: Calendar,
      status: 'good',
      description: 'Resource adequacy indicator',
      progress: 0,
      unit: 'weeks',
    },
    {
      id: 'fpy',
      title: 'First-Pass Yield (FPY)',
      value: '92.0%',
      trend: { value: 0, isPositive: true },
      icon: Target,
      status: 'excellent',
      description: 'Quality of maintenance',
      progress: 92,
      unit: '%',
    },
  ];

  // Enhanced KPIs (from EnhancedKPIDashboard logic)
  const enhancedKPIs: KPICard[] = [
    {
      id: 'enh-otcr',
      title: 'On-Time Completion Rate (OTCR)',
      value: '100.0%',
      trend: { value: 5.2, isPositive: true },
      icon: CheckCircle,
      status: 'excellent',
      description: 'ISO 14224 compliance metric',
      progress: 100,
      unit: '%',
    },
    {
      id: 'enh-mttr',
      title: 'Mean Time to Repair (MTTR)',
      value: '5.2',
      trend: { value: -12, isPositive: false },
      icon: Clock,
      status: 'good',
      description: 'Critical asset responsiveness',
      progress: 0,
      unit: 'hours',
    },
    {
      id: 'enh-backlog',
      title: 'Maintenance Backlog',
      value: '3.2',
      trend: { value: -8, isPositive: false },
      icon: Calendar,
      status: 'good',
      description: 'Resource adequacy indicator',
      progress: 0,
      unit: 'weeks',
    },
    {
      id: 'enh-fpy',
      title: 'First-Pass Yield (FPY)',
      value: '92.0%',
      trend: { value: 0, isPositive: true },
      icon: Target,
      status: 'excellent',
      description: 'Quality of maintenance',
      progress: 92,
      unit: '%',
    },
    {
      id: 'utilization',
      title: 'Technician Utilization',
      value: '87%',
      trend: { value: 2.4, isPositive: true },
      icon: Users,
      status: 'excellent',
      description: 'Labor allocation efficiency',
      progress: 87,
      unit: '%',
    },
    {
      id: 'predictive',
      title: 'Predictive Success Rate',
      value: '88%',
      trend: { value: 7.3, isPositive: true },
      icon: Brain,
      status: 'excellent',
      description: 'AI prediction accuracy',
      progress: 88,
      unit: '%',
    },
    {
      id: 'compliance',
      title: 'Compliance Adherence',
      value: '100%',
      trend: { value: 0, isPositive: true },
      icon: Shield,
      status: 'excellent',
      description: 'OSHA, ISO, IEEE standards',
      progress: 100,
      unit: '%',
    },
    {
      id: 'cost-efficiency',
      title: 'Cost Efficiency',
      value: '$1,247',
      trend: { value: -5.2, isPositive: true },
      icon: DollarSign,
      status: 'good',
      description: 'Avg cost per work order',
      progress: 78,
      unit: '',
    },
  ];

  // Merge and deduplicate by id
  const allKPIs = [...mainKPIs, ...enhancedKPIs].filter(
    (kpi, idx, arr) => arr.findIndex(k => k.id === kpi.id) === idx
  );
  return allKPIs;
}

function getStatusIconBg(status) {
  switch (status) {
    case 'excellent': return 'bg-green-500/20 text-green-600';
    case 'good': return 'bg-blue-500/20 text-blue-600';
    case 'warning': return 'bg-yellow-400/20 text-yellow-600';
    case 'critical': return 'bg-red-500/20 text-red-600';
    default: return 'bg-gray-400/20 text-gray-600';
  }
}

export function CinematicKPICarousel({ workOrders }: CinematicKPICarouselProps) {
  const kpiCards = getUnifiedKPICards(workOrders);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const visibleCards = 1 + (window.innerWidth >= 1024 ? 2 : window.innerWidth >= 768 ? 1 : 0);

  // Embla carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    align: 'start',
    containScroll: 'trimSnaps',
  });

  // Update currentSlide in response to Embla's select event
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    setCurrentSlide(emblaApi.selectedScrollSnap());
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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

  // Accessibility: ARIA
  const carouselLabel = 'Key Performance Indicators Carousel';

  return (
    <div className="relative" aria-label={carouselLabel} aria-live="polite">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Key Performance Indicators</h3>
          <p className="text-sm text-muted-foreground">Unified real-time maintenance metrics</p>
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
            {currentSlide + 1} / {kpiCards.length}
          </Badge>
        </div>
      </div>

      <div
        className="w-full px-6"
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={carouselLabel}
        tabIndex={0}
      >
        <div className="flex gap-x-4 -ml-2 md:-ml-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            const isActive = index === currentSlide;
            return (
              <div
                key={kpi.id}
                className="px-2 w-[22%] min-w-[220px] max-w-[280px] h-[230px] flex-shrink-0 flex flex-col justify-between"
                aria-label={`${kpi.title} card`}
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
                      : 'bg-white/5 dark:bg-zinc-900/10 text-muted-foreground border border-primary/20 hover:border-primary/40 shadow-md')
                  }
                  onClick={() => emblaApi && emblaApi.scrollTo(index)}
                  style={{
                    cursor: 'pointer',
                    transform: isActive ? 'scale(1.05)' : 'scale(0.98)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
                    boxShadow: isActive ? '0 8px 25px -8px var(--theme-primary, rgba(59, 130, 246, 0.15)), 0 0 20px 5px var(--theme-primary, rgba(59, 130, 246, 0.1))' : '0 4px 10px -4px var(--theme-primary, rgba(59, 130, 246, 0.05))'
                  }}
                >
                  <CardContent className="p-4 relative z-10 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full shadow ${getStatusIconBg(kpi.status)} ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'scale(1)' : 'scale(0.8)', transition: 'opacity 0.4s ease-in-out 0.1s, transform 0.4s ease-in-out 0.1s' }}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge className={
                        `px-3 py-1 rounded-full text-xs font-semibold ` +
                        (kpi.status === 'excellent'
                          ? 'bg-green-700/30 text-green-300 border border-green-700/50 dark:bg-green-900/60 dark:text-green-300'
                          : kpi.status === 'good'
                            ? 'bg-blue-700/30 text-blue-300 border border-blue-700/50 dark:bg-blue-900/60 dark:text-blue-300'
                            : kpi.status === 'warning'
                              ? 'bg-yellow-700/30 text-yellow-300 border border-yellow-700/50 dark:bg-yellow-900/60 dark:text-yellow-300'
                              : kpi.status === 'critical'
                                ? 'bg-red-700/30 text-red-300 border border-red-700/50 dark:bg-red-900/60 dark:text-red-300'
                                : 'bg-gray-700/30 text-gray-300 border border-gray-700/50 dark:bg-gray-900/60 dark:text-gray-300')
                      } style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'scale(1)' : 'scale(0.8)', transition: 'opacity 0.4s ease-in-out 0.2s, transform 0.4s ease-in-out 0.2s' }}>
                        {kpi.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.4s ease-in-out 0.3s, transform 0.4s ease-in-out 0.3s' }}>
                        <h4 className="font-semibold text-base leading-tight truncate text-card-foreground" style={{ backdropFilter: 'blur(4px)' }}>{kpi.title}</h4>
                      </div>
                      <div style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.4s ease-in-out 0.4s, transform 0.4s ease-in-out 0.4s' }}>
                        <p className="text-xs text-muted-foreground truncate" style={{ backdropFilter: 'blur(4px)' }}>{kpi.description}</p>
                      </div>
                      <div className="flex items-baseline gap-2" style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.5s ease-in-out 0.5s, transform 0.5s ease-in-out 0.5s' }}>
                        <span className="text-3xl font-extrabold text-orange-400 dark:text-orange-300 tracking-tight" style={{ textShadow: isActive ? '0 0 8px rgba(255, 149, 0, 0.6)' : 'none', transition: 'text-shadow 0.5s ease-in-out 0.5s' }}>{kpi.value}</span>
                        {kpi.target && (
                          <span className="text-sm text-muted-foreground">/ {kpi.target}</span>
                        )}
                      </div>
                      {kpi.progress !== undefined && kpi.progress > 0 && (
                        <div className="space-y-1" style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'translateX(0)' : 'translateX(-20px)', transition: 'opacity 0.5s ease-in-out 0.6s, transform 0.5s ease-in-out 0.6s' }}>
                          <div className="relative h-2 w-full bg-background/30 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: isActive ? `${kpi.progress}%` : '0%', transition: 'width 0.8s ease-out 0.7s' }}></div>
                          </div>
                          <div className="text-xs text-muted-foreground">Progress: {kpi.progress}%</div>
                        </div>
                      )}
                      <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend.isPositive ? 'text-green-500' : 'text-red-500'}`} style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s ease-in-out 0.8s, transform 0.5s ease-in-out 0.8s' }}>
                        <TrendingUp className={`h-4 w-4 ${!kpi.trend.isPositive ? 'rotate-180' : ''} ${kpi.trend.isPositive ? 'text-green-500' : 'text-red-500'}`} style={{ transform: isActive ? 'translateY(0) scale(1)' : 'translateY(5px) scale(0.8)', transition: 'transform 0.3s ease-in-out 0.8s' }} />
                        <span>{Math.abs(kpi.trend.value)}%</span>
                        <span className="text-muted-foreground text-xs">vs last month</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center gap-2 mt-4" aria-label="KPI slide indicators">
        {kpiCards.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
}
