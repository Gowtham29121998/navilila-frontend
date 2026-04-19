import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import reactSlick from 'react-slick';
import api from '../../../utils/api';
import { ChevronLeft, ChevronRight } from '../../../assets/images/icons.jsx';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HeroSection.css';

const Slider = typeof reactSlick === 'function' ? reactSlick : reactSlick.default;

const HeroSection = () => {
  const [slidesData, setSlidesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = React.useRef(null);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.heroSection && data.heroSection.length > 0) {
          setSlidesData(data.heroSection);
        } else {
          setSlidesData([
            {
              _id: 1,
              image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
              title: "Shape the Future",
              subtitle: "Harness the power of cutting-edge web technologies to build blazing fast and stunningly beautiful digital experiences.",
              link: "/services"
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch hero settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroContent();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    arrows: false,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
  };

  if (loading) return <div className="hero-loading"></div>;

  return (
    <div className="hero-wrapper">
      <button 
        className="hero-arrow hero-prev" 
        onClick={() => sliderRef.current?.slickPrev()} 
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <div className="hero-container">
        <Slider ref={sliderRef} {...settings}>
          {slidesData.map((slide, index) => (
            <div key={slide._id || index} className="hero-slide">
              <img src={slide.image} alt={slide.title} className="hero-slide-bg" />
              <div className="hero-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                {slide.link && (
                  <Link to={slide.link}>
                    <button className="hero-btn">Get Started</button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <button 
        className="hero-arrow hero-next" 
        onClick={() => sliderRef.current?.slickNext()} 
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

export default HeroSection;
