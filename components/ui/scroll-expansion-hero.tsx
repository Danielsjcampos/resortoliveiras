
import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent as ReactTouchEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Logic only applies if we are 'interacting' with this specific section or globally? 
      // The original code attaches to window, which effectively hijacks scrolling for the whole page.
      // Modifying to be a bit safer: check if section is in viewport or close? 
      // For now, sticking to original logic but being careful. 
      // Actually, the original code hijacks the WHOLE window scroll. 
      // If we put this in the middle of a page, it might be annoying.
      // However, the user asked for this specific component. 
      // We should check if the element is visible to activate the scroll hijacking.
      
      const element = sectionRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      // Only hijack if we are somewhat focused on it? 
      // The original demo has it as a full page thing. 
      // If used as a section, we might want to check bounding client rect.
      
      // For the sake of "Effect", let's keep it global but maybe only when active? 
      // Let's stick closer to the provided code but add a check if it's "in view" enough to matter?
      // Actually, the provided code logic `window.scrollY <= 5` suggests it expects to be at the TOP of the page 
      // or handling its own internal fake scroll.
      // If we put this in the MIDDLE of the page (section #tour-virtual), `window.scrollY` will NOT be <= 5.
      // This logic: `if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5)`
      // implies it is designed to be a Hero at the very top.
      
      // ADAPTATION REQUIRED:
      // Since we are placing this in the middle of the page, we cannot rely on `window.scrollY <= 5`.
      // We should rely on whether the user has scrolled TO this section.
      
      // However, making it work seamlessly in the middle of a page is complex without purely blocking scroll.
      // Let's assume for now we want the visual effect. 
      // If I cannot easily adapt the scroll hijacking to be "section-specific", I might revert to a version that 
      // just expands based on scroll position relative to the element (parallax-like).
      
      // Let's try to adapt the logic:
      // If the top of the section is at the top of the viewport (or close), THEN start the expansion logic.
    };
    
    // NOTE: The provided code is highly invasive (prevents default scroll).
    // It is designed as a "Scroll Expansion Hero".
    // Putting it in the middle of the page (Video Promo section) might be problematic if not careful.
    // I'll modify it to be less invasive:
    // Instead of hijacking scroll events to set progress, I will calculate progress based on scroll position.
    
  }, []);
  
  // RE-WRITE STRATEGY:
  // Use `useScroll` framer-motion hook or standard scroll listener to map scroll position to expansion.
  // The original code manually tracks "progress" via deltaY to simulate a timeline.
  
  // Let's try to preserve the "feel" but using standard scroll position if possible.
  // OR, if we want the EXACT effect, we can't easily put it in the middle of the page without "sticky" behavior.
  // Let's make the section `sticky` or `h-[200vh]` and map scroll progress to that?
  
  // Let's go with a `sticky` container approach.
  // The container is `h-[300vh]`. The content is `sticky top-0 h-screen`.
  // As you scroll down the container, the progress 0 -> 1 happens.
  
  return <ScrollExpandMediaStickyVersion {...{mediaType, mediaSrc, posterSrc, bgImageSrc, title, date, scrollToExpand, textBlend, children}} />;
};

// ... Wait, I should not completely rewrite the code if I can avoid it, but the requested code is explicitly "Hero" (Top of page).
// The user wants it "NA PARTE DO VIDEO".
// If I paste the code as-is, `window.scrollY <= 5` will break the "un-expansion" logic if it's not at the top.
// And `window.addEventListener('wheel', ... { passive: false })` + `e.preventDefault()` will break the entire site's scrolling.
// I MUST refactor this to be scroll-friendly for a section.

// Refactored Component below:

const ScrollExpandMediaStickyVersion = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far the element is from the center/top of the viewport
      // When rect.top is at viewportHeight (just entering), progress is 0.
      // When rect.top is at 0 (reached top), progress should be 1.
      // User requested "center of screen = full". 
      // Center of screen means rect.top is around viewportHeight/2 (depending on element height).
      // Let's make it fully expanded when it hits the top (sticky start) or slightly before.
      
      // Formula: 
      // Distance from Top: rect.top
      // Range to animate: viewportHeight (enter) -> 0 (top)
      
      // Define the scroll range for expansion
      // Expansion starts when the element's top is at the bottom of the viewport (viewportHeight)
      // Expansion completes when the element's top is at the vertical center of the viewport (viewportHeight / 2)
      const startScrollY = viewportHeight; // Element top at bottom of viewport
      const endScrollY = viewportHeight / 2; // Element top at vertical center of viewport
      
      // Calculate progress based on rect.top within this range
      // As rect.top goes from startScrollY down to endScrollY, progress goes from 0 to 1
      let p = 1 - ((rect.top - endScrollY) / (startScrollY - endScrollY));
      
      // Clamp p between 0 and 1 for the expansion phase
      p = Math.min(Math.max(p, 0), 1);
      
      // However, we also have the sticky scroll "hold" phase.
      // The container is tall (200vh). 
      // The sticky content is h-[100dvh].
      // The expansion happens as the container scrolls into view.
      // Once the container's top hits the viewport top (rect.top <= 0), it becomes sticky.
      // During the sticky phase, we want the media to remain fully expanded (progress = 1).
      // The current `p` calculation handles the entry phase.
      // If rect.top is less than or equal to `endScrollY` (i.e., element is at or above center),
      // we should ensure progress is 1.
      if (rect.top <= endScrollY) {
        p = 1;
      }

      // After the sticky phase, the container will scroll out of view.
      // The current setup has h-[200vh] for the container and h-[100dvh] for the sticky content.
      // This means the sticky content will stay for 100vh of scroll.
      // The `progress` should remain 1 during this sticky hold.
      // The current `p` calculation correctly sets it to 1 once it reaches `endScrollY`.
      // It will stay 1 until the container scrolls completely out of view.
      
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Visual Progress is now the same as 'progress' because we calculated it directly above
  const visualProgress = progress; 
  
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isMuted, setIsMuted] = useState(true);
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setIsMobile(window.innerWidth < 768);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Interpolate directly to viewport size
  // Visual Progress accelerates the expansion so it finishes earlier in the scroll
  
  const startWidth = 300;
  const startHeight = isMobile ? 250 : 400;
  
  const currentWidth = startWidth + (dimensions.width - startWidth) * visualProgress;
  const currentHeight = startHeight + (dimensions.height - startHeight) * visualProgress;
  
  const textTranslateX = visualProgress * (isMobile ? 100 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';
  const showContent = visualProgress >= 0.85;

  return (
    <div ref={containerRef} className="relative h-[200vh] mb-[-100vh] bg-stone-900 z-20">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center">
            {/* Background */}
            <motion.div
                className='absolute inset-0 z-0 h-full'
                style={{ opacity: 1 - visualProgress }}
            >
                <img
                src={bgImageSrc}
                alt='Background'
                className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black/40' />
            </motion.div>

            {/* Main Content Layer */}
            <div className='container mx-auto flex flex-col items-center justify-center relative z-10 h-full'>
                
                {/* Expanding Media */}
                <div
                    className='relative z-20 transition-all duration-75 ease-out rounded-2xl overflow-hidden shadow-2xl group'
                    style={{
                        width: `${currentWidth}px`,
                        height: `${currentHeight}px`,
                        borderRadius: `${(1 - visualProgress) * 16}px`,
                        boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {mediaType === 'video' ? (
                        mediaSrc.includes('youtube.com') || mediaSrc.includes('youtu.be') ? (
                            <div className='relative w-full h-full'>
                                <iframe
                                    width='100%'
                                    height='100%'
                                    src={
                                        mediaSrc.includes('embed')
                                            ? mediaSrc + (mediaSrc.includes('?') ? '&' : '?') + `autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`
                                            : `https://www.youtube.com/embed/${mediaSrc.split('v=')[1] || mediaSrc.split('/').pop()}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`
                                    }
                                    className='w-full h-full rounded-xl object-cover'
                                    frameBorder='0'
                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                    allowFullScreen
                                />
                                {/* Mute Toggle Button */}
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsMuted(!isMuted);
                                    }}
                                    className="absolute bottom-8 right-8 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all border border-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 duration-300"
                                    title={isMuted ? "Ligar Som" : "Mudo"}
                                >
                                    {isMuted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <video
                                    src={mediaSrc}
                                    poster={posterSrc}
                                    autoPlay
                                    muted={isMuted}
                                    loop
                                    playsInline
                                    className='w-full h-full object-cover rounded-xl'
                                />
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="absolute bottom-8 right-8 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all border border-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 duration-300"
                                >
                                    {isMuted ? (
                                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                    )}
                                </button>
                            </div>
                        )
                    ) : (
                        <img
                            src={mediaSrc}
                            alt={title || 'Media content'}
                            className='w-full h-full object-cover rounded-xl'
                        />
                    )}
                    
                    {/* Overlay on media */}
                     <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl pointer-events-none'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - progress * 0.5 }}
                        transition={{ duration: 0.2 }}
                      />
                </div>

                {/* Floating Text / Title */}
                <div className='absolute flex flex-col items-center text-center z-30 pointer-events-none'>
                     <div className={`transition-transform duration-300 ease-out flex flex-col gap-2 items-center mix-blend-difference text-white`}
                          style={{
                               opacity: 1 - Math.pow(progress, 3) // Fade out faster
                          }}
                     >
                          {date && (
                            <p
                              className='text-2xl md:text-3xl text-olive-200 font-serif translate-y-8'
                              style={{ transform: `translateX(-${textTranslateX}vw)` }}
                            >
                              {date}
                            </p>
                          )}
                          <div className='flex gap-4 items-center justify-center'>
                                <h2
                                className='text-4xl md:text-6xl lg:text-8xl font-bold transition-transform duration-300'
                                style={{ transform: `translateX(-${textTranslateX}vw)` }}
                                >
                                {firstWord}
                                </h2>
                                <h2
                                className='text-4xl md:text-6xl lg:text-8xl font-bold transition-transform duration-300'
                                style={{ transform: `translateX(${textTranslateX}vw)` }}
                                >
                                {restOfTitle}
                                </h2>
                          </div>
                     </div>
                </div>

                {/* Content that appears at the end */}
                <motion.div
                    className='absolute bottom-10 left-0 right-0 z-40 flex flex-col items-center justify-center text-white'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </div>
      </div>
    </div>
  );
};

export default ScrollExpandMedia;
