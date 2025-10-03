import FAQ from '@/components/FAQ'
import PlanCTA from '@/components/PlanCTA'
import Pricing from '@/components/Pricing'
import PropertyCTA from '@/components/PropertyCTA'
import { PricingTable } from '@clerk/nextjs'
import Image from 'next/image'
import { FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa'

const page = () => {
  return (
    <main className="flex flex-col w-full text-gray-900 bg-blue-300">
       <h1 className='text-4xl md:-5xl font-bold text-blue-600 items-center justify-items-center'>
         <p>Welcome to Sky-Realty</p>
         <p>"The Smart Way to Manage your Rental Properties"</p>
        </h1>

      {/* Hero Section */}
      <section id="home" className="bg-blue-500 py-20 px-5 md:px-20 flex flex-col-reverse md:flex-row items-center gap-10">
      
        <div className="md:w-1/2 space-y-6">
          
          <p className="text-lg md:text-xl text-gray-100">
            Sky-Realty is the all-in-one digital platform designed for <strong>property owners, landlords, and real estate agents to manage rental properties with ease</strong>.
          </p>
          <p>
            Whether you manage one property or dozens, Sky-Realty simplifies the complex tasks of rent collection, tenant communication, maintenance scheduling, and lease management all from your phone or computer.
          </p>
          <p className="font-semibold text-white">
            You don't need to be tech-savvy. Sky-Realty walks you through everything step by step.
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
      <section id="messaging" className="bg-blue-200 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10">
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
            Sky-Realty comes with an <strong>in-app messaging tool</strong>. This means realtors and landlords can <strong>send messages to tenants directly inside the app</strong>. No more missed calls or lost text messages.
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
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/assets/images/maintenance-request.jpg"
            alt="maintenance"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </div>
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
            Say goodbye to late payments and manual tracking. Sky-Realty allows tenants to pay digitally, with automated reminders and confirmations. You always know who has paid and who hasn't.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Automated rent reminders reduce missed payments</li>
            <li>Secure digital transactions no need to handle cash or checks</li>
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
            The Sky-Realty dashboard gives you a <strong>complete overview </strong> of your properties, tenants, rent collection, maintenance requests, and messages all in one place.
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

      {/* Team Section */}
      <section id="team" className="bg-blue-700 py-20 px-5 md:px-20 flex flex-col gap-8 text-gray-100">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Meet Our Team</h2>
        <p className="text-center max-w-3xl mx-auto">
          Sky-Realty was built by a team of experts passionate about real estate, technology, and customer experience. Every feature is designed based on real landlord and agent needs.
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

      
      {/* Optional Extra Write-up Section */}
      <section id="about" className="bg-blue-600 py-20 px-5 md:px-20 text-gray-100">
        <h2 className="text-3xl font-bold text-white text-center mb-10">About Sky-Realty</h2>
        <div className="max-w-4xl mx-auto space-y-6 text-lg">
          <p>
            Sky-Realty is built for <strong>everyone who manages rental properties</strong>, whether you have one apartment or an entire portfolio of buildings. Our goal is to remove the headaches of property management, so you can focus on growing your business, keeping tenants happy, and maintaining steady income.
          </p>
          <p>
            You don't need to know about complicated software or technology. Every feature is intuitive, clearly labeled, and supported with guides. From the moment you log in, you can start managing tenants, collecting rent, tracking maintenance, and sending messages all without a single phone call.
          </p>
          <p>
            Our <strong>in-app messaging tool</strong> ensures landlords and agents are always connected with tenants. No more chasing texts or missed phone calls. Tenants can also share photos or videos of issues, schedule appointments, and communicate securely all within the app.
          </p>
          <p>
            Sky-Realty also helps you manage leases efficiently. You can upload digital copies, set reminders for renewals, and track the status of contracts. Our dashboard gives you a complete overview of occupancy, payments, maintenance requests, and communications in one place.
          </p>
          <p>
            We prioritize <strong>security, transparency, and simplicity</strong>. All documents, payments, and messages are stored safely, accessible only to you and your tenants. This reduces misunderstandings, ensures compliance, and builds trust between landlords and tenants.
          </p>
          <p>
            Additionally, our <strong>analytics and reporting tools</strong> allow you to track income, monitor late payments, and make informed decisions to grow your property business. Even if you are not tech-savvy, Sky-Realty explains everything in clear language and provides support every step of the way.
          </p>
          <p>
            Our platform is not region-specific; it is designed to work globally, adapting to different rental markets and property types. Whether you manage residential apartments, commercial units, or mixed-use buildings, Sky-Realty gives you the tools to simplify operations and maximize efficiency.
          </p>
          <p>
            We listen to our users and continuously improve. Every new feature, update, or enhancement is based on real feedback from landlords, agents, and tenants. When you use Sky-Realty, you're not just using software you're joining a community dedicated to making rental management easier, smarter, and stress-free.
          </p>
          <p className="font-bold text-white">
            With Sky-Realty, less hassle and more control isn't just a promise it's a reality.
          </p>
        </div>
      </section>

      <section>
        <FAQ />
        </section>  



      {/* Footer */}
     

<footer className="bg-blue-800 text-gray-100 py-10 px-5 md:px-20">
  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
    {/* Brand */}
    <div className="space-y-2">
      <h3 className="font-bold text-xl">Sky-Realty</h3>
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
        <a href="https://twitter.com/yourofficial" target="_blank" aria-label="Twitter" className="hover:text-blue-300">
          <FaTwitter />
        </a>
        <a href="https://linkedin.com/company/https://www.linkedin.com/in/izzy-enem" target="_blank" aria-label="LinkedIn" className="hover:text-blue-300">
          <FaLinkedin />
        </a>
        <a href="https://instagram.com/yourofficial" target="_blank" aria-label="Instagram" className="hover:text-blue-300">
          <FaInstagram />
        </a>
      </div>
      <div className="mt-4 space-y-1">
        <p className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:support@skyrealtyae.com">support@skyrealtyae.com</a></p>
        <p className='flex items-center gap-2'><FaEnvelope /> <a 
        href='mailto:info@skyrealtyae.com'>info@skyrealtyae.com</a></p>
        <p className='flex items-center gap-2'><FaEnvelope /> <a
        href='mailto:contact@skyrealtyae.com'>contact@skyrealtyae.com</a></p>
        <p className="flex items-center gap-2"><FaPhone /> +1(469)670-8318</p>
      
      </div>
    </div>
  </div>
  <p className="text-center text-sm mt-10">&copy; {new Date().getFullYear()} Sky-Realty. All rights reserved.</p>
</footer>

            


    </main>
  )
}

export default page