// components/ManageSection.jsx
import Image from 'next/image';


export default function ManageSection() {
  return (
    <section className="flex flex-col md:flex-row items-center my-20 px-10 md:px-20">
      {/* Left side: Text */}
      <div className="flex-1 mb-10 md:mb-0 md:pr-10">
        <h2 className="text-4xl font-bold text-blue-700 mb-6">
          How to manage properties and stay in control.
        </h2>
        <p className="text-lg text-gray-700">
          From your first property to your first tenant, Sky Realty makes everything easy, organized, and straightforward for you.
        </p>
      </div>

      {/* Right side: Image */}
      <div className="flex-1">
        <Image
          src="/assets/images/customer-service.jpg"
          height={1000}
          width={1000}
          alt="Managing properties"
          className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
          priority
        />
      </div>
    </section>
  );
}