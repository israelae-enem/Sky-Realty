import type { NextConfig } from "next";
import { dirname } from "path";


const path = require('path');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
 
  
 }


  
  /* config options here */


export default nextConfig;
