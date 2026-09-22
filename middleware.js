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
            
            <!-- Icon / Logo -->
            <div class="w-[120px] h-[120px] bg-[#111827] rounded-full flex items-center justify-center mb-8 relative shadow-lg">
                <img src="/images/wolfim%20studio%20white-Photoroom.png" alt="Wolfim Studio" class="w-20 h-20 object-contain" onerror="this.outerHTML='<span class=\\'text-white font-bold text-xl\\'>WOLFIM</span>'" />
                
                <!-- Status Icon -->
                <div class="absolute -bottom-1 -right-1 bg-[#ff5f56] w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
            </div>

            <!-- Text Content -->
            <h1 class="heading-font text-[2rem] md:text-[2.75rem] font-medium text-[#111827] mb-5 tracking-tight">
                Sitio web temporalmente suspendido
            </h1>
            
            <p class="text-[#565f6d] text-[1.1rem] mb-10 max-w-2xl leading-relaxed">
                El servicio se encuentra momentáneamente en pausa.<br class="hidden md:block"/>
                Para solicitar la reanudación del servicio, por favor contactar con <strong>Wolfim Studio</strong>.
            </p>

            <!-- WhatsApp Action Button -->
            <!-- NOTA: Reemplazar el Href con el enlace correcto de WA -->
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-8 py-3.5 bg-[#25D366] hover:bg-[#20b858] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-[1rem]">
                <!-- WhatsApp SVG Icon -->
                <svg class="mr-2.5 w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 21.018l-.01.002c-1.576 0-3.123-.42-4.48-1.216l-.321-.188-3.333.874.887-3.25-.207-.328A9.782 9.782 0 013.06 12.028c0-5.385 4.387-9.769 9.775-9.769 2.61 0 5.064 1.018 6.908 2.864 1.846 1.845 2.862 4.298 2.862 6.91 0 5.386-4.385 9.773-9.774 9.773h-.8z"/>
                    <path fill="#fafafa" d="M12.031 4.024c-4.412 0-8.005 3.593-8.005 8.003 0 1.41.369 2.788 1.069 4.004l-1.144 4.186 4.28-.12.593-.163c-.157.086-2.585-.125-2.585-.125l-.261-.152c1.298.775 2.793 1.185 4.331 1.185h.008c4.414 0 8.008-3.594 8.008-8.005 0-2.14-.834-4.153-2.348-5.666-1.514-1.513-3.526-2.347-5.666-2.347h-.001zm0-1.765c5.387 0 9.774 4.388 9.774 9.773 0 2.612-1.016 5.065-2.862 6.91-1.844 1.846-4.298 2.864-6.908 2.864-5.388 0-9.775-4.384-9.775-9.769 0-1.7.44-3.35 1.28-4.815l-1.5-5.5 5.63 1.476a9.756 9.756 0 014.361-1.037l.004-.002z"/>
                    <path fill="#fafafa" d="M17.11 14.195c-.279-.14-1.652-.816-1.907-.909-.256-.093-.443-.14-.629.14-.187.279-.723.909-.886 1.096-.163.187-.327.21-.606.07-.279-.14-1.179-.434-2.247-1.389-.83-.742-1.39-1.66-1.553-1.94-.163-.279-.017-.43.123-.57.126-.126.279-.327.42-.49.14-.164.186-.279.279-.466.093-.186.046-.35-.024-.49-.07-.14-.629-1.516-.862-2.075-.226-.544-.456-.47-.629-.479-.163-.008-.35-.008-.537-.008s-.489.07-.745.35c-.256.279-.978.955-.978 2.33 0 1.375 1.002 2.704 1.142 2.89.14.187 1.97 3.006 4.773 4.215.666.287 1.186.459 1.593.588.669.213 1.278.183 1.76.111.54-.08 1.652-.676 1.885-1.328.233-.653.233-1.212.163-1.328-.07-.116-.256-.186-.535-.326z"/>
                </svg>
                Contactar por WhatsApp
            </a>
            
            <!-- Divider -->
            <hr class="w-full max-w-[20rem] border-gray-200 mt-12 mb-6" />
            
            <p class="text-[0.85rem] text-[#9ca3af]">
                &copy; Wolfim Studio - Todos los derechos reservados.
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
