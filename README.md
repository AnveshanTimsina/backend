# techno-treasure: Electronics E-commerce

techno-treasure is an interactive e-commerce platform specializing in the commerce of electronics gadgets, utilizing a technology stack comprising Node.js, PostgreSQL, HTML, CSS, and JavaScript.

## About the Project

This project has been developed as a part of the Database Management System (DBMS) course by Anveshan Timsina. This is the backend of the project.

## Features

- **User registration and login**: Users can sign up and log in using their unique username and password as either a buyer or a seller. The user information is stored in a PostgreSQL database with password being hashed for security.
- **Product search**: Users can search for the products they wish to find using the product name.
- **Shopping cart**: Products can be added into the buyer’s cart with a simple click of a button
- **Product and seller details**: Users can go into the product info page to get all the information of every listed product as well as the name and contact information of the seller of that product.
- **Mark a product as favorite**: Buyers can mark certain products as favorites which will subsequently be displayed in the homepage of the buyer.

## Installation and Usage

**Prerequisites**

- Node.js and npm installed on your system.
- Access to the PostgreSQL database.

**Installation steps**

1. Clone the repository or download the source code.
2. Install dependencies  
   npm install
3. Start the server
   npm run start
4. Access the application hosted on your system (localhost).

## Deployment

The entire system (frontend, backend and database) is hosted on vercel.
You may access the webapp using the follwing link: https://frontend-ten-eosin-80.vercel.app/

## How it works

**1\. User Registration and Authentication**:  

Users can create an account by providing essential details such as name, email, and password. The system categorizes users as either buyers or sellers during registration. Buyers can browse and purchase products, while sellers can list and manage their products. Likewise, upon registration, users log in using their email or username. The authentication mechanism employs bcrypt for hashing passwords, ensuring secure storage and protection against unauthorized access.

**2\. Product Management**:  

After logging in, sellers access a dedicated dashboard where they can add new products. They input product details, such as name, description, price, and stock quantity. This information is stored in the PostgreSQL database and made available for buyers. And, the buyers can browse the catalog of products, which includes comprehensive descriptions, and specifications. They can use search options to find specific items.

**3\. Shopping Cart**:  

Buyers can add items to their cart using straightforward JavaScript, HTML, and CSS interfaces. Items are associated with the user's unique identifier and stored in the browser’s local storage, allowing persistence and consistency across sessions.

**4\. User Interface and Experience**:  

The front end, developed using HTML, CSS, and JavaScript, is designed to be responsive and user-friendly. The interface adjusts to various screen sizes, providing an experience as seamless as possible.

**5\. System Flow and Integration**:

The backend, powered by Node.js and Express, handles server-side operations, including request processing and routing. The communication between different components of the application ensures smooth operation from user interactions to data management.

## Major encountered issues

**1\. Issues with making the UI dynamic**:

While my knowlege and experience regarding the backend of a web app was sufficient for a project of this scale, I was new to building the frontend including the UI design and implementation of a project with these many dynamic elements, which is why I faced numerous hurdles while writing the CSS and JS for the frontend of this project mostly brought on by my own inexperience. This, for the most part was resolved through some light analysis and implementation of the basics of writing frontend code and copious amounts of googling.

**2\. Integration hell**:

Within a few days of dedicating myself to this project, I found myself falling into the infamous pits of integration hell. The elements of my project worked fine in isolation but it was a headache getting them to work together as somehow the separate elements weren't communicating with each other as I'd expected them to. I managed to connect the backend and my database swiftly however the frontend-backend connection wasn't so simple, esp. when hosting was involved. This led me to see "Cors Error" for hours on end before it was finally resolved.

**3\. Hosting difficulties**:

Knowing that this was the first project I'd be hosting somewhere other than my own PC, I was sure to need extensive guides to help me deploy. This is the reason I chose to go with Vercel even though I was recommended using Render as due to the sheer popularity of Vercel, there was a sizeable community behind it for support and queries. However, even with the help from its documentation and the online Vercel community, hosting and deployment wasn't as easy as I'd anticipated. I kept running into issues very novel to me which took a lot of patience and problem-solving to resolve.

## Limitations and Future Enhancement

- This project uses the local storage of the browser to store the user information that it needs to access the cart, user’s favorite products, etc. i.e. information that is user-specific. This is an insecure method of achieving this. Rather, the use of JWTs is recommended which is much more secure and is the industry standard as of now. To avoid extra complexity, this has been neglected. However, this concern can be addressed while making future enhancements to the project.  

- As this project does not have cross device integration due to the lack of a smartphone app, it may not provide a seamless experience as the user will be limited to their browser to use this which might not be well optimized for phone screens as it would be if it had a dedicated mobile app.  

- This project lacks an admin page in the frontend, so the viewing and manipulation of data in the admin level needs to be done by tinkering with the source code which is not the standard practice.  

- This project lacks a review feature which I deem to be very important. Users can’t post reviews as of yet. This is to be the first update on the web app in the future.

