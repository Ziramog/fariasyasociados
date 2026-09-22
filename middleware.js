import { NextResponse } from 'next/server';

const SUSPENDED_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Servicio temporalmente no disponible</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap');
        body {
            font-family: 'Montserrat', sans-serif;
            background-color: #f7f5f0; 
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .heading-font {
            font-family: 'Playfair Display', serif;
        }
        .window-card {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 10px 30px -5px rgba(0, 0, 0, 0.02);
            background: linear-gradient(to bottom, #ffffff, #fcfcfb);
        }
        .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23f1ede6' fill-opacity='0.6' d='M0,256L48,245.3C96,235,192,213,288,218.7C384,224,480,256,576,256C672,256,768,224,864,213.3C960,203,1056,213,1152,213.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: bottom;
            background-size: 100% auto;
        }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="window-card w-full max-w-4xl rounded-2xl overflow-hidden relative border border-gray-100 flex flex-col min-h-[550px]">
        
        <!-- Browser top bar -->
        <div class="h-12 bg-white flex items-center px-5 justify-between relative z-20">
            <div class="flex space-x-2">
                <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div class="h-6 bg-gray-100/70 rounded-full w-full max-w-xl mx-6"></div>
            <div class="flex space-x-1">
                <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                <div class="w-1 h-1 rounded-full bg-gray-300"></div>
            </div>
        </div>

        <!-- Main content area -->
        <div class="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center relative z-10 bg-pattern">
            
            <!-- Icon -->
            <div class="w-[120px] h-[120px] bg-[#fdfaf5] rounded-full flex items-center justify-center mb-8 relative border border-orange-50 shadow-sm">
                <svg class="w-16 h-16 text-[#b0a8a0]" fill="currentColor" viewBox="0 0 24 24">
                    <!-- Server icon -->
                    <rect x="3" y="5" width="18" height="5" rx="1.5" fill="currentColor"></rect>
                    <circle cx="6" cy="7.5" r="1" fill="white"></circle>
                    <rect x="9" y="7" width="3" height="1" fill="white"></rect>
                    
                    <rect x="3" y="13" width="18" height="5" rx="1.5" fill="currentColor"></rect>
                    <circle cx="6" cy="15.5" r="1" fill="white"></circle>
                    <rect x="9" y="15" width="3" height="1" fill="white"></rect>
                </svg>
                
                <!-- Lock Icon -->
                <div class="absolute -bottom-1 -right-1 bg-[#d97d41] w-11 h-11 rounded-lg flex items-center justify-center border-4 border-white shadow-sm">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
            </div>

            <!-- Text Content -->
            <h1 class="heading-font text-[2rem] md:text-[2.75rem] font-medium text-[#111827] mb-5 tracking-tight">
                Servicio temporalmente no disponible
            </h1>
            
            <p class="text-[#565f6d] text-[1.1rem] mb-10 max-w-2xl leading-relaxed">
                El sitio web se encuentra en mantenimiento o suspendido temporalmente.<br class="hidden md:block"/>
                Por favor, regrese más tarde.
            </p>
            
            <!-- Divider -->
            <hr class="w-full max-w-[20rem] border-gray-200 mt-6 mb-6" />
            
            <p class="text-[0.85rem] text-[#9ca3af]">
                Lamentamos las molestias ocasionadas.
            </p>
        </div>
    </div>
</body>
</html>`;

export function middleware(req) {
  return new NextResponse(SUSPENDED_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
