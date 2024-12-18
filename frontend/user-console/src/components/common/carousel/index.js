import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import 'swiper/swiper.min.css';
import 'swiper/modules/navigation/navigation.min.css';
import 'swiper/modules/pagination/pagination.min.css';
import 'swiper/modules/effect-coverflow/effect-coverflow.min.css';
import 'swiper/modules/effect-cube/effect-cube.min.css';
import 'swiper/modules/effect-fade/effect-fade.min.css';
import 'swiper/modules/effect-flip/effect-flip.min.css';

// import required modules
import { shuffle } from "lodash";
import { Link } from "react-router-dom";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper";
export default function Carousel(props) {
  const { data } = props;
  var newData = [];
  newData = shuffle(data)
    .slice(0, 5)
    .map(({ id, background }) => ({
      id,
      background,
    }));
  return (
    <>
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        effect={"fade"}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="mySwiper"
        style={{ padding: '30px 0' }}
      >
        {newData.map((event, index) => (
          <SwiperSlide key={event.id || `carousel-${index}`}>
            <Link to={`/event/${event.id}`} target="_blank">
              <img
                className="w-full h-auto px-0"
                src={event.background}
                alt={`carousel-${event.name || index}`}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
