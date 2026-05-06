================================================================================
  SYDNEY RENTAL - React Frontend
================================================================================

OVERVIEW
--------
Sydney Rental is a property rental web application built for the Sydney market.
It allows tenants to browse, search, and enquire about rental listings, and
gives landlords a portal to post and manage their properties.


TECH STACK
----------
- React 18              - UI framework
- React Router DOM v6   - Client-side routing
- React Scripts (CRA)   - Build tooling (Create React App)
- Fetch API             - HTTP requests to the backend REST API
- CSS (plain)           - Styling (no CSS framework)


PROJECT STRUCTURE
-----------------
sydney-rental/
  public/
    index.html              - HTML entry point
  src/
    api/
      client.js             - Central API client (auth, properties, enquiries)
    components/
      Navbar.js/.css        - Top navigation bar
      PropertyCard.js/.css  - Card used in listings grid
      ImageUploader.js/.css - Image upload UI
      PostListingModal.js   - Modal for landlords to create/edit a listing
      ProtectedRoute.js     - Redirects unauthenticated / wrong-role users
    context/
      AuthContext.js        - Global auth state (JWT token, current user)
    pages/
      HomePage.js           - Landing page
      ListingsPage.js       - Searchable / filterable property listings
      PropertyDetailPage.js - Single property detail view
      LandlordPortal.js     - Landlord dashboard (manage listings & enquiries)
      TenantDashboard.js    - Tenant dashboard (saved properties, enquiries)
      ProfilePage.js        - Edit profile & change password
      MapPage.js            - Map view of listings
      GuidePage.js          - Renting guide / tips page
      LoginPage.js          - Login form
      RegisterPage.js       - Registration form (choose tenant or landlord role)
  .env                      - Environment variables (API URL)
  package.json              - Dependencies and npm scripts


PAGES & ROUTES
--------------
  /               - Home page
  /listings       - Browse all rental listings (search, filter, sort)
  /listing/:id    - Property detail page
  /map            - Map view
  /guide          - Renting guide
  /login          - Login
  /register       - Register (tenant or landlord)
  /landlord       - Landlord portal  [requires landlord login]
  /dashboard      - Tenant dashboard [requires tenant login]
  /profile        - User profile     [requires login]


USER ROLES
----------
  Tenant    - Browse listings, save favourites, send and track enquiries
  Landlord  - Post and manage listings, view and reply to enquiries


ENVIRONMENT VARIABLES
---------------------
Create a .env file in the project root (one already exists):

  REACT_APP_API_URL=https://sydney-rental-api.vercel.app

  Change this URL to point at a local backend during development:
  REACT_APP_API_URL=http://localhost:5000/api


PREREQUISITES
-------------
- Node.js  v16 or higher  (https://nodejs.org)
- npm      v8  or higher  (comes with Node.js)


HOW TO START THE PROJECT (Development)
---------------------------------------
1. Open a terminal and navigate to this folder:
     cd path/to/sydney-rental

2. Install dependencies (only needed the first time, or after pulling new code):
     npm install

3. Start the development server:
     npm start

4. The app will open automatically at:
     http://localhost:3000



BACKEND API
-----------
This repository is the FRONTEND only.
The backend REST API is hosted separately at:
  https://sydney-rental-api.vercel.app

The API handles:
  - User authentication (JWT)
  - Property CRUD
  - Image storage
  - Enquiry management

To run the full stack locally you will also need the backend repo running
at http://localhost:5000, then update REACT_APP_API_URL in .env accordingly.


AUTHENTICATION
--------------
Auth tokens are stored in browser localStorage under the key "sra_token".
The token is sent automatically with every API request as a Bearer token
in the Authorization header.

================================================================================
