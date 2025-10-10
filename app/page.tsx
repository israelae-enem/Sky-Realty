import FAQ from '@/components/FAQ'
import PlanCTA from '@/components/PlanCTA'
import Pricing from '@/components/Pricing'
import PropertyCTA from '@/components/PropertyCTA'
import Image from 'next/image'
import { FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa'

const page = () => {
  return (
    <main className="flex flex-col w-full text-gray-900 bg-blue-300">
        <section className="relative w-full h-[80vh] overflow-hidden">
        <div>
         <video
         src="/assets/videos/hero.mp4"
         autoPlay
         loop
         muted
         playsInline
         className='absolute top-0 lrft-0 w-full h-full object-cover'
         />
         </div>


       <div className="absolute inset-0 bg-black/50" />

       <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white space-y-6 px-6">
       <h1 className="text-4xl md:text-6xl font-bold text-[#302cfc] drop-shadow-lg">
         Elevate Your Real Estate Management 🚀
       </h1>
       <p className="max-w-2xl text-lg text-gray-200">
          Simplify your property management with Sky RealtyAE built for realtors and tenants who want control, clarity, and collaboration.
         </p>
        <div className="flex gap-4">
         <a
          href="/sign-in"
         className="bg-[#302cfc] hover:bg-[#241fd9] px-6 py-3 rounded-lg font-medium transition"
         >
        Get Started
      </a>
      <a
        href="/subscription"
        className="border border-[#302cfc] hover:bg-[#302cfc]/10 px-6 py-3 rounded-lg font-medium transition"
        >
        Subscribe
        </a>
       </div>
     </div>
   </section>

   <section className='bg-blue-400'>
    <div className="bg-black text-white py-20 px-6 md:px-16 text-center space-y-6">
  <h2 className="text-3xl md:text-4xl font-bold text-[#302cfc]">
    The First All-in-One Property Management Platform in the UAE 🌍
  </h2>

  <p className="max-w-3xl mx-auto text-gray-300 leading-relaxed text-lg">
    Although Sky Realtyae is built to empower realtors anywhere in the world, 
    our roots and vision begin right here in the Middle East 
    where real estate is booming, innovation is reshaping the market, 
    and digital transformation is defining the future of property management.
  </p>

  <p className="max-w-3xl mx-auto text-gray-400 leading-relaxed text-lg">
    Sky Realtyae brings together everything realtors need to manage their properties, 
    tenants, and maintenance all in one seamless, intelligent, 
    and easy-to-use platform. From lease uploads to rent tracking, 
    team collaboration, and real-time communication we're redefining 
    what real estate management looks like across the region and beyond.
  </p>

  <p className="max-w-3xl mx-auto text-gray-300 leading-relaxed text-lg">
    Our mission is simple: to make property management smarter, 
    faster, and more human helping every realtor thrive in the 
    dynamic real estate landscape of the Middle East and beyond.
  </p>
</div>

   </section>


    <section className="bg-gray-900 text-white py-16 px-6 sm:px-16 lg:px-32">
       <h1 className="text-2xl font-bold text-[#302cfc] mb-8">Get Started with Sky RealtyAE</h1>
  
        <p className="mb-6 text-lg">
        <strong>Step 1: Sign In or Create an Account</strong><br />
        Click the <span className="text-[#302cfc] font-semibold">Sign In</span> button at the top of the page. 
       If you already have an account, simply log in. If you're new, choose <span className="text-[#302cfc]  font-semibold">Create an Account</span> and get started instantly no long forms, no hassle.
      </p>

       <p className="mb-6 text-lg">
       <strong>Step 2: Join Sky Realty</strong><br />
       After signing in, click <span className="text-[#302cfc] font-semibold">Join</span> and select your role:
       <br />• <strong>Realtor:</strong> Manage properties, tenants, leases, and maintenance requests with ease.
       <br />• <strong>Tenant:</strong> Access your lease information, submit maintenance requests, and stay updated on your rental.
       </p>

       <p className="mb-6 text-lg">
         <strong>Step 3: Complete Your Onboarding</strong><br />
        Realtors will quickly set up their dashboard and first property. Tenants will connect with their realtor and access rental details. 
        In just <span className="text-[#302cfc] font-semibold">three clicks</span>, your account is ready to explore all Sky Realtyae features from automated rent tracking to team collaboration tools.
        </p>

        <p className="text-lg mt-4">
         Experience real estate management that's fast, simple, and designed just for you. Start your journey with <span className="text-[#302cfc] font-semibold">Sky Realty</span> today!
        </p>
       </section>



      {/* Hero Section */}
      <section id="home" className="bg-blue-500 py-20 px-5 md:px-20 flex flex-col-reverse md:flex-row items-center gap-10">
      
        <div className="md:w-1/2 space-y-6">
          
          <p className="text-lg md:text-xl text-gray-100">
            Sky-RealtyAE is the all-in-one digital platform designed for <strong>property owners, landlords, and real estate agents to manage rental properties with ease</strong>.
          </p>
          <p>
            Whether you manage one property or dozens, Sky-Realty simplifies the complex tasks of rent collection, tenant communication, maintenance scheduling, and lease management all from your phone or computer.
          </p>
          <p className="font-semibold text-white">
            You don't need to be tech-savvy. We walks you through everything step by step.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/assets/images/hero-pic.jpg"
            alt="hero"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Messaging Tool Section */}
      <section id="messaging" className="bg-blue-200 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10 ">
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/assets/images/profile.jpg"
            alt="messaging"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl font-bold text-blue-700">Communicate with Tenants Instantly</h2>
          <p>
            Sky-RealtyaAE comes with an <strong>in-app messaging system</strong>. This means realtors and landlords can <strong>send messages to tenants directly inside the app</strong>. No more missed calls or lost text messages.
          </p>
          <p>
            Tenants can also reply immediately, share photos of issues, or ask questions. All conversations are stored safely in your dashboard, so you have a complete record without needing to search through emails or phones.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Send reminders for rent payments or upcoming maintenance</li>
            <li>Receive photos or videos from tenants for verification</li>
            <li>Keep a full history of communications for transparency</li>
          </ul>
          <p className="text-blue-700 font-bold mt-2">
            Save time, reduce misunderstandings, and improve tenant satisfaction.
          </p>
        </div>
      </section>

      {/* Maintenance Section */}
      <section id="maintenance" className="bg-blue-700 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10 text-gray-100">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl font-bold text-white">Maintenance Made Simple</h2>
          <p>
            Handling repairs has never been easier. Tenants can submit maintenance requests directly through the platform, including photos, videos, and detailed notes.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Instant notifications when a tenant reports an issue</li>
            <li>Approve requests, assign contractors, or schedule repairs with a few clicks</li>
            <li>Track progress and updates in real time</li>
            <li>Keep tenants informed automatically no extra follow-up required</li>
          </ul>
          <p className="text-white font-bold mt-2">
            Reduce phone calls, save time, and maintain professionalism effortlessly.
          </p>
        </div>
        
          <Image
            src="/assets/images/maintenance-request.jpg"
            alt="maintenance"
            width={1000}
            height={1000}
            className="md:w-1/2 flex justify-center rounded-lg shadow-lg w-full h-full object-cover"
          />
        
      </section>

      {/* Rent Collection Section */}
      <section id="rent" className="bg-blue-400 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/assets/images/customer-service.jpg"
            alt="rent"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl font-bold text-blue-800">Secure Rent Collection</h2>
          <p>
            Say goodbye to late payments and manual tracking. With automated reminders and confirmations. You always know who has paid and who hasn't.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Automated rent reminders reduce missed payments</li>
            <li>All payment history is stored for easy access and auditing</li>
          </ul>
          <p className="text-blue-800 font-bold mt-2">
            Collect rent effortlessly and build reliable cash flow.
          </p>
        </div>
      </section>

      {/* Lease Management Section */}
      <section id="leases" className="bg-blue-500 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10 text-gray-100">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl font-bold text-white">Lease Management Simplified</h2>
          <p>
            Keep all your lease agreements, renewal dates, and tenant information organized in one place. Sky-Realty makes it easy to store digital copies, set reminders for renewals, and track contract statuses.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Digitally sign and store leases securely</li>
            <li>Automated notifications for upcoming renewals</li>
            <li>Access contracts anytime, anywhere</li>
          </ul>
          <p className="text-white font-bold mt-2">
            No more paperwork, lost documents, or missed renewals.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/assets/icons/teanat features.jpg"
            alt="leases"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Dashboard Section */}
      <section id="dashboard" className="bg-blue-200 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/assets/images/dash.jpg"
            alt="dashboard"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl font-bold text-blue-700">Your Centralized Dashboard</h2>
          <p>
           Our dashboard gives you a <strong>complete overview </strong> of your properties, tenants, rent collection, maintenance requests, and messages all in one place.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Visual summaries of occupancy, income, and upcoming tasks</li>
            <li>Quick access to tenant communications and maintenance requests</li>
            <li>Everything organized, searchable, and trackable</li>
          </ul>
          <p className="text-blue-700 font-bold mt-2">
            Save hours every week by managing your business from a single screen.
          </p>
        </div>
      </section>


          {/* Optional Extra Write-up Section */}
      <section id="about" className="bg-blue-600 py-20 px-5 md:px-20 text-gray-100">
        <h2 className="text-3xl font-bold text-white text-center mb-10">About Sky-RealtyAE</h2>
        <div className="max-w-4xl mx-auto space-y-6 text-lg">
          <p>
            Sky-RealtyAE is built for <strong>everyone who manages rental properties</strong>, whether you have one apartment or an entire portfolio of buildings. Our goal is to remove the headaches of property management, so you can focus on growing your business, keeping tenants happy, and maintaining steady income.
          </p>
          <p>
            You don't need to know about complicated software or technology. Every feature is intuitive, clearly labeled, and supported with guides. From the moment you log in, you can start managing tenants, collecting rent, tracking maintenance, and sending messages all without a single phone call.
          </p>
          <p>
            Our <strong>in-app messaging tool</strong> ensures landlords and agents are always connected with tenants. No more chasing texts or missed phone calls. Tenants can also share photos or videos of issues, schedule appointments, and communicate securely all within the app.
          </p>
          <p>
            Sky-RealtyAE also helps you manage leases efficiently. You can upload digital copies, set reminders for renewals, and track the status of contracts. Our dashboard gives you a complete overview of occupancy, payments, maintenance requests, and communications in one place.
          </p>
          <p>
            We prioritize <strong>security, transparency, and simplicity</strong>. All documents, payments, and messages are stored safely, accessible only to you and your tenants. This reduces misunderstandings, ensures compliance, and builds trust between landlords and tenants.
          </p>
          <p>
            Additionally, our <strong>analytics and reporting tools</strong> allow you to track income, monitor late payments, and make informed decisions to grow your property business. Even if you are not tech-savvy, Sky-RealtyAE explains everything in clear language and provides support every step of the way.
          </p>
          <p>
            Our platform is not region-specific, it is designed to work globally, adapting to different rental markets and property types. Whether you manage residential apartments, commercial units, or mixed-use buildings, We give you the tools to simplify operations and maximize efficiency.
          </p>
          <p>
            We listen to our users and continuously improve. Every new feature, update, or enhancement is based on real feedback from landlords, agents, and tenants. When you use Sky-Realty, you're not just using software you're joining a community dedicated to making rental management easier, smarter, and stress-free.
          </p>
          <p className="font-bold text-white">
            With Sky-RealtyAE, less hassle and more control isn't just a promise it's a reality.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="bg-blue-700 py-20 px-5 md:px-20 flex flex-col gap-8 text-gray-100">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Meet Our Team</h2>
        <p className="text-center max-w-3xl mx-auto">
          Sky-RealtyAE was built by a team of experts passionate about real estate, technology, and customer experience. Every feature is designed based on real landlord and agent needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
          <Image src="/assets/images/team.jpg" alt="team" width={1000} height={1000} className="rounded-lg shadow-lg w-full h-full object-cover" />
          <Image src="/assets/images/team-meeting.jpg" alt="meeting" width={1000} height={1000} className="rounded-lg shadow-lg w-full h-full object-cover" />
          <Image src="/assets/images/agent-tenant.jpg" alt="agent-tenant" width={1000} height={1000} className="rounded-lg shadow-lg w-full h-full object-cover" />
          <Image src="/assets/images/key-handover.jpg" alt="key-handover" width={1000} height={1000} className="rounded-lg shadow-lg w-full h-full object-cover" />
        </div>
      </section>

      {/* CTA + Pricing Section */}
      <section id="plans" className="bg-gray-900 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10 text-gray-900">
        <PlanCTA />
        <PropertyCTA />
      </section>

      <section id="pricing" className="bg-blue-500 py-20 px-5 md:px-20 text-gray-100">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">Explore Our Plans</h2>
        <div className="flex justify-center">
          <Pricing />
        </div>
      </section>


        <section className="bg-gray-900 text-white py-20 px-6 md:px-16 text-center">
  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[#302cfc]">
    Why Realtors Love Sky RealtyAE 💙
  </h2>

  <p className="max-w-2xl mx-auto text-gray-300 mb-12 text-lg">
    We've built Sky Realtyae to simplify every part of your property management journey.  
    Here's why realtors across the Middle East and beyond are choosing us to power their business.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-[#302cfc] mb-3">🏠 Smart Property Management</h3>
      <p className="text-gray-300">
        Add, edit, and track all your properties in one dashboard. 
        Keep leases, tenants, and rent details organized and accessible anytime.
      </p>
    </div>

    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-[#302cfc] mb-3">💬 Seamless Communication</h3>
      <p className="text-gray-300">
        Connect with your tenants instantly, send updates, 
        and manage maintenance requests without endless phone calls or emails.
      </p>
    </div>

    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-[#302cfc] mb-3">📄 Digital Lease Management</h3>
      <p className="text-gray-300">
        Upload and store lease documents securely. 
        Manage renewals, track deadlines, and keep your business fully digital.
      </p>
    </div>

    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-[#302cfc] mb-3">📊 Realtor Dashboard</h3>
      <p className="text-gray-300">
        Stay on top of your numbers with real-time stats, rent tracking, 
        and team insights all beautifully visualized in one place.
      </p>
    </div>

    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-[#302cfc] mb-3">👥 Team Collaboration</h3>
      <p className="text-gray-300">
        Invite team members, assign roles, and collaborate efficiently. 
        Sky Realtyae grows with your team and your business.
      </p>
    </div>

    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-[#302cfc] mb-3">🔒 Secure & Reliable</h3>
      <p className="text-gray-300">
        Your data and documents are safe with us  
        protected by enterprise-grade security powered by Supabase and Clerk.
      </p>
    </div>
  </div>

  <div className="flex justify-center mt-12">
    <a
      href="/sign-in"
      className="bg-[#302cfc] hover:bg-[#241fd9] px-6 py-3 rounded-lg font-medium transition"
    >
      Start Managing Smarter Today
    </a>
  </div>
</section>


      <section>
        <FAQ />
        </section>


         
       <section className="bg-[#302cfc] text-white py-20 px-6 md:px-16 text-center">
  <h2 className="text-4xl md:text-5xl font-bold mb-6">
    Join the Future of Real Estate 🚀
  </h2>

  <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-100 mb-10 leading-relaxed">
    Sky Realtyae is redefining how realtors in the Middle East and beyond manage their properties.  
    Smarter tools. Seamless workflows. Total control.  
    It's time to elevate your real estate business and stay ahead of the market.
  </p>

  <div className="flex justify-center gap-4 flex-wrap">
    <a
      href="/sign-in"
      className="bg-white text-[#302cfc] hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition"
    >
      Get Started Now
    </a>
    <a
      href="/subscription"
      className="border border-white hover:bg-white hover:text-[#302cfc] font-semibold px-6 py-3 rounded-lg transition"
    >
      View Plans
    </a>
  </div>

  <p className="mt-10 text-gray-200 text-sm">
    Built for modern realtors. Powered by innovation. 🌍
  </p>
</section> 



      {/* Footer */}
     

<footer className="bg-blue-800 text-gray-100 py-10 px-5 md:px-20">
  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
    {/* Brand */}
    <div className="space-y-2">
      <h3 className="font-bold text-xl">Sky-RealtyAE</h3>
      <p>Smarter rental management at your fingertips.</p>
    </div>

    {/* Navigation */}
    <div className="space-y-2">
      <h3 className="font-bold">Navigation</h3>
      <ul className="space-y-1">
        <li><a href="#home" className="hover:text-blue-300">Home</a></li>
        <li><a href="#messaging" className="hover:text-blue-300">Messaging</a></li>
        <li><a href="#maintenance" className="hover:text-blue-300">Maintenance</a></li>
        <li><a href="#rent" className="hover:text-blue-300">Rent Collection</a></li>
        <li><a href="#leases" className="hover:text-blue-300">Leases</a></li>
        <li><a href="#dashboard" className="hover:text-blue-300">Dashboard</a></li>
        <li><a href="#team" className="hover:text-blue-300">Team</a></li>
        <li><a href="#plans" className="hover:text-blue-300">Plans</a></li>
        <li><a href='/help' className='hover:text-blue-300'>HELP CENTER</a></li>
        <li><a href='/terms' className='hover:text-blue-300'> Terms & Conditions </a> </li>
        <li><a href='/privacy' className='hover:text-blue-300'>Privacy</a></li>
      </ul>
    </div>

    {/* Contact & Social */}
    <div className="space-y-2">
      <h3 className="font-bold">Connect</h3>
      <div className="flex gap-4 text-2xl">
        <a href="https://linkedin.com/company/https://www.linkedin.com/in/izzy-enem" target="_blank" aria-label="LinkedIn" className="hover:text-blue-300">
          <FaLinkedin />
        </a>
        <a href="https://instagram.com/sky-realtyae" target="_blank" aria-label="Instagram" className="hover:text-blue-300">
          <FaInstagram />
        </a>
      </div>
      <div className="mt-4 space-y-1">
        <p className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:support@skyrealtyae.com">support@skyrealtyae.com</a></p>
        <p className='flex items-center gap-2'><FaEnvelope /> <a 
        href='mailto:info@skyrealtyae.com'>info@skyrealtyae.com</a></p>
        <p className='flex items-center gap-2'><FaEnvelope /> <a
        href='mailto:contact@skyrealtyae.com'>contact@skyrealtyae.com</a></p>
        <p className="flex items-center gap-2"><FaPhone />+(971)558265374</p>
        

      
      </div>
    </div>
  </div>
  <p className="text-center text-sm mt-10">&copy; {new Date().getFullYear()} Sky-Realtyae. All rights reserved.</p>
</footer>

            


    </main>
  )
}

export default page