import { useState, useEffect, useRef } from 'react';
import { Check, Clock, List, Plus, ArrowRight, Star, ChevronDown, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for tasks
const mockTasks = [
    { id: 1, title: 'Complete project proposal', status: 'completed', priority: 'high', dueDate: '2025-05-10' },
    { id: 2, title: 'Review design mockups', status: 'in-progress', priority: 'medium', dueDate: '2025-05-05' },
    { id: 3, title: 'Schedule team meeting', status: 'pending', priority: 'low', dueDate: '2025-05-07' },
    { id: 4, title: 'Research market trends', status: 'in-progress', priority: 'high', dueDate: '2025-05-15' },
];

// Utility functions for GSAP-like animations
const useGSAPLike = () => {
    const animate = (element, properties, duration = 0.5, delay = 0) => {
        if (!element) return;

        // Convert GSAP-like properties to CSS transitions
        const transitions = [];
        Object.keys(properties).forEach(key => {
            // Map GSAP properties to CSS properties
            const cssKey = key === 'y' ? 'transform' :
                key === 'x' ? 'transform' :
                    key === 'opacity' ? 'opacity' :
                        key === 'scale' ? 'transform' : key;

            transitions.push(`${cssKey} ${duration}s ease ${delay}s`);

            // Apply the property
            if (key === 'y') {
                element.style.transform = `translateY(${properties[key]}px)`;
            } else if (key === 'x') {
                element.style.transform = `translateX(${properties[key]}px)`;
            } else if (key === 'scale') {
                element.style.transform = `scale(${properties[key]})`;
            } else if (key === 'opacity') {
                element.style.opacity = properties[key];
            } else {
                element.style[key] = properties[key];
            }
        });

        element.style.transition = transitions.join(', ');
    };

    return { animate };
};

const TaskCard = ({ task, index }) => {
    const cardRef = useRef(null);
    const { animate } = useGSAPLike();

    useEffect(() => {
        const element = cardRef.current;
        if (element) {
            // Initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';

            // Animate in with delay based on index
            setTimeout(() => {
                animate(element, { opacity: 1, y: 0 }, 0.5, index * 0.1);
            }, 100);
        }
    }, [index]);

    return (
        <div
            ref={cardRef}
            className="bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 hover:shadow-lg transition-shadow duration-300"
            style={{
                borderLeftColor:
                    task.priority === 'high' ? '#f43f5e' :
                        task.priority === 'medium' ? '#eab308' :
                            '#22c55e'
            }}
        >
            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                <h3 className="font-medium text-gray-800 break-words">{task.title}</h3>
                <div className="flex space-x-2">
                    {task.status === 'completed' ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center whitespace-nowrap">
                            <Check size={12} className="mr-1" /> Done
                        </span>
                    ) : task.status === 'in-progress' ? (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center whitespace-nowrap">
                            <Clock size={12} className="mr-1" /> In Progress
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center whitespace-nowrap">
                            <List size={12} className="mr-1" /> Pending
                        </span>
                    )}
                </div>
            </div>
            <div className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
        </div>
    );
};

// 3D Floating Component
const FloatingElement = ({ children, delay = 0, offset = 10 }) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        let startY = 0;
        let direction = 1;
        let frame;

        const animate = () => {
            startY += 0.03 * direction;

            if (startY > offset) {
                direction = -1;
            } else if (startY < 0) {
                direction = 1;
            }

            element.style.transform = `translateY(${startY}px)`;
            frame = requestAnimationFrame(animate);
        };

        setTimeout(() => {
            frame = requestAnimationFrame(animate);
        }, delay);

        return () => cancelAnimationFrame(frame);
    }, [offset, delay]);

    return (
        <div ref={elementRef} className="transition-transform duration-1000">
            {children}
        </div>
    );
};

// Parallax Hero Section
const ParallaxHero = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { width, height, left, top } = heroRef.current.getBoundingClientRect();

            const x = (clientX - left) / width - 0.5;
            const y = (clientY - top) / height - 0.5;

            setMousePosition({ x, y });
        };

        const handleTouchMove = (e) => {
            if (!heroRef.current || !e.touches[0]) return;
            const { clientX, clientY } = e.touches[0];
            const { width, height, left, top } = heroRef.current.getBoundingClientRect();

            const x = (clientX - left) / width - 0.5;
            const y = (clientY - top) / height - 0.5;

            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return (
        <div
            ref={heroRef}
            className="relative overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-800 text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-0 left-0 w-full h-full">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full opacity-30"
                            style={{
                                width: `${Math.random() * 10 + 5}px`,
                                height: `${Math.random() * 10 + 5}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                transform: `translateX(${mousePosition.x * -20}px) translateY(${mousePosition.y * -20}px)`,
                                transition: 'transform 0.5s ease-out'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <div
                    className="transform transition-transform duration-200 ease-out"
                    style={{
                        transform: `translateX(${mousePosition.x * -15}px) translateY(${mousePosition.y * -15}px)`
                    }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                        Manage Tasks <span className="text-purple-300">Effortlessly</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-xl text-purple-100">
                        Keep your projects on track with our intuitive task management system.
                    </p>
                </div>

                <div
                    className="transform transition-transform duration-300 ease-out delay-100"
                    style={{
                        transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 10}px)`
                    }}
                >
                    <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap gap-3 sm:gap-4">
                        <button className="bg-purple-500 hover:bg-purple-600 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium flex items-center transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base">
                            Get Started <ArrowRight size={16} className="ml-2" />
                        </button>
                        <button className="bg-transparent border border-purple-400 hover:border-purple-300 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium flex items-center transition-all duration-300 text-sm sm:text-base">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating elements - hidden on smallest screens */}
            <div className="hidden sm:block">
                <FloatingElement delay={200} offset={15}>
                    <div className="absolute -right-16 lg:right-10 top-10 w-24 sm:w-32 h-24 sm:h-32 bg-purple-500 rounded-2xl opacity-20 transform rotate-12" />
                </FloatingElement>

                <FloatingElement delay={100} offset={20}>
                    <div className="absolute -left-10 bottom-10 w-16 sm:w-20 h-16 sm:h-20 bg-indigo-400 rounded-full opacity-20" />
                </FloatingElement>
            </div>
        </div>
    );
};

// Animated features section
const FeaturesSection = () => {
    const featuresRef = useRef(null);
    const features = [
        {
            icon: <List className="text-purple-500" size={24} />,
            title: "Task Organization",
            description: "Organize tasks by project, priority, or deadline to stay on top of your work."
        },
        {
            icon: <Clock className="text-blue-500" size={24} />,
            title: "Time Tracking",
            description: "Track time spent on tasks to improve productivity and estimation."
        },
        {
            icon: <Star className="text-amber-500" size={24} />,
            title: "Priority Management",
            description: "Easily set and adjust priorities to focus on what matters most."
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const featureElements = document.querySelectorAll('.feature-item');
                        featureElements.forEach((el, index) => {
                            setTimeout(() => {
                                el.classList.add('animate-in');
                            }, index * 150);
                        });
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (featuresRef.current) {
            observer.observe(featuresRef.current);
        }

        return () => {
            if (featuresRef.current) {
                observer.unobserve(featuresRef.current);
            }
        };
    }, []);

    return (
        <div ref={featuresRef} className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Powerful Features</h2>

            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="feature-item bg-white p-5 sm:p-6 rounded-xl shadow-md opacity-0 transform translate-y-10 transition-all duration-500"
                    >
                        <div className="mb-4 p-3 inline-block bg-gray-50 rounded-lg">{feature.icon}</div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const headerRef = useRef(null);
    const { animate } = useGSAPLike();
    const menuRef = useRef(null);

    useEffect(() => {
        const element = headerRef.current;
        if (element) {
            // Initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';

            // Animate in
            setTimeout(() => {
                animate(element, { opacity: 1, y: 0 }, 0.5, 0);
            }, 100);
        }

        // Handle scroll for sticky header
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        if (!isMenuOpen) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <header
            ref={headerRef}
            className={`bg-white py-3 sm:py-4 px-4 sm:px-6 md:px-10 sticky top-0 z-50 transition-shadow duration-300 ${
                isScrolled ? 'shadow-md' : 'shadow-sm'
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-1.5 sm:p-2 rounded-lg">
                        <Check size={18} />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-gray-800">TaskMaster</span>
                </div>

                {/* Desktop navigation */}
                <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                    <a href="#" className="text-gray-800 font-medium hover:text-purple-600 transition-colors">Features</a>
                    <a href="#" className="text-gray-800 font-medium hover:text-purple-600 transition-colors">Pricing</a>
                    <a href="#" className="text-gray-800 font-medium hover:text-purple-600 transition-colors">Resources</a>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                        <Link to="/login" className="text-white">Login</Link>
                    </button>
                </nav>

                {/* Mobile navigation toggle */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-600 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
      
            {/* Mobile menu */}
            {isMenuOpen && (
                <div 
                    ref={menuRef}
                    className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4 absolute left-0 right-0 mx-4 animate-fadeIn"
                >
                    <nav className="flex flex-col space-y-4">
                        <a href="#" className="text-gray-800 py-2 hover:text-purple-600 transition-colors">Features</a>
                        <a href="#" className="text-gray-800 py-2 hover:text-purple-600 transition-colors">Pricing</a>
                        <a href="#" className="text-gray-800 py-2 hover:text-purple-600 transition-colors">Resources</a>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-5 rounded-lg transition-colors">
                            <Link to="/login" className="text-white">Login</Link>
                        </button>
                    </nav>
                </div>
            )}
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </header>
    );
};

// Main App Component
export default function TaskManagementHomepage() {
    // Animation for the entire page
    const appRef = useRef(null);
    const { animate } = useGSAPLike();

    useEffect(() => {
        const element = appRef.current;
        if (element) {
            element.style.opacity = '0';

            setTimeout(() => {
                animate(element, { opacity: 1 }, 0.8, 0);
            }, 100);
        }
    }, []);

    return (
        <div ref={appRef} className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-12 sm:pb-16">
                <ParallaxHero />

                <FeaturesSection />

                {/* Tasks preview section */}
                <div className="mt-10 sm:mt-12 md:mt-16 mb-8 sm:mb-12">
                    <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Tasks</h2>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors text-sm sm:text-base">
                            <Plus size={16} className="mr-1" /> New Task
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockTasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index} />
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center mx-auto">
                            View All Tasks <ChevronDown size={16} className="ml-1" />
                        </button>
                    </div>
                </div>

                {/* Call to action */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 text-white text-center shadow-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to boost your productivity?</h2>
                    <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">Join thousands of teams already managing their work effectively with TaskMaster.</p>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        <button className="bg-white text-indigo-600 hover:bg-gray-100 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors shadow-md text-sm sm:text-base">
                            Start Free Trial
                        </button>
                        <button className="bg-transparent border border-white hover:bg-white/10 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 text-white py-8 sm:py-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Features</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Pricing</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Integrations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Documentation</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Tutorials</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">About Us</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Careers</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
                </div>
            </footer>
        </div>
    );
}