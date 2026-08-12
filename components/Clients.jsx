'use client';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

const CLIENTS = [
  // { id: 1, name: 'DINO', logo: '/images/clients/dino.png' },
];

const Clients = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    CLIENTS.length > 0 && (
    <section ref={sectionRef} className="bg-[#F6F6F6] pt-[12px] pb-[12px]">
      <div className="px-4 md:px-[50px]">
        {/* Client logo cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid overflow-x-auto md:overflow-visible gap-[15px] md:gap-[20px] scrollbar-hide md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CLIENTS.map((client, i) => (
            <div
              key={client.id}
              className={`flex-shrink-0 w-[160px] md:w-auto transition-all duration-500 ease-in-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[50px]'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="bg-white rounded-[20px] p-3 md:p-4 flex items-center justify-center min-h-[110px] md:min-h-[130px]">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={180}
                  height={180}
                  className="object-contain w-[80%] h-auto max-h-[85px] md:max-h-[100px]"
                  style={{ filter: 'grayscale(1)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    )
  );
};

export default Clients;
