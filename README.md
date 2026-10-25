# PetMarketplace

A small classifieds site for pet products and services. I made it as my exam project for the React course.

## Live demo

https://pet-marketplace-tawny.vercel.app/

## Demo accounts

If you don't want to register, you can use one of these two test accounts:

| Email           | Password |
|-----------------|----------|
| test@test.com   | 123456   |
| test1@test1.com | 123456   |

Log in with one of them to create, edit and delete your own ads. Then log in with the other one – you will see that you can only view, favorite and comment on ads that are not yours.

## Tech stack

- React 19 + Vite
- React Router (for the pages and the route guards)
- Firebase Authentication (email and password)
- Firebase Firestore (the database)

## Running the project locally

1. Clone the repository:
   ```
   git clone https://github.com/VladiNikolov80/PetMarketplace.git
   cd PetMarketplace
   ```
2. Install the dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open the address that shows up in the terminal (usually `http://localhost:5173`).

You don't need a `.env` file or any extra setup. The Firebase config is already in `src/firebase.js`. At first I thought these values should be secret, but they are not – Firebase protects the data with Firestore Security Rules on the server, not by hiding the config.

## Project structure

```
src/
  components/      Reusable parts (Navbar, Footer, ListingCard, route guards)
  contexts/        AuthContext – who is logged in
  pages/           One file per page (Home, Catalog, Details, Login, Register, Create, Edit, Profile, Contact)
  services/        Functions that talk to Firestore (listings, favorites, comments)
  utils/           Small helpers (readable Firebase error messages)
  firebase.js      Firebase setup
```

## Functional Guide

### 1. Project Overview

**Application Name:** PetMarketplace

**Application Category / Topic:** Classifieds / marketplace site for pet products and services.

**Main Purpose:** I wanted to make a small classifieds site only for pet stuff, a bit like OLX but without all the unrelated categories. Users can post an ad for a **product** (food, toys, accessories) or a **service** (walking, training, grooming). Other people can browse the ads, save the ones they like to Favorites and leave comments.

Every ad also has a pet type. Products have condition and brand, services have availability. I also added two ad types: **Offering**, when you have something to give, and **Looking for**, when you are searching for something. This way the site works for both sides.

### 2. User Access & Permissions

**Guest (Not Authenticated)**
- Pages a guest can open: `/`, `/catalog`, `/catalog/:id`, `/contact`, `/login`, `/register`
- A guest can see all ads (title, description, price, category, image and the author's name) in the Catalog and on the Details page, and can read the comments.

**Authenticated User**
- A logged-in user sees everything a guest sees, plus Add Ad (`/create`) and Profile (`/profile`).
- On the Details page (`/catalog/:id`) they get some extra buttons.
- They can create new ads. They can edit or delete **only their own** ads – the Edit/Delete buttons are hidden for other people's ads, and the functions also check the author again before calling Firestore. They can add other people's ads to Favorites (not their own) and comment on any ad.

### 3. Authentication & Session Handling

**Authentication Flow**
- When the app starts, `AuthProvider` listens to Firebase's `onAuthStateChanged`. Until the first answer comes, the app shows nothing (`loading` state). I did this so the page doesn't flash the wrong menu for a second.
- The app checks if someone is logged in only through this listener. I don't store any token or flag myself.
- When someone registers, Firebase creates the user and I also save a `users/{uid}` document in Firestore (name, email, createdAt). The name from the Register form is saved as the Firebase `displayName` with `updateProfile()`. This name is shown instead of the email in the Navbar, on the user's ads ("Posted by …") and on their comments. After that the user goes to `/`.
- After login the user also goes to `/`.
- On logout Firebase signs the user out, `onAuthStateChanged` gets `null`, and the Navbar and the guards change right away.

**Session Persistence**
- Firebase Authentication keeps the session by itself – I didn't write any `localStorage` or cookie code. The rest of the app only uses it through `AuthContext` / `useAuth()`.
- After a page refresh `onAuthStateChanged` runs again and returns the user who was logged in, so you stay logged in.

### 4. Routing Structure

**Route Guards Logic**
- I made two guard components. Both are layout routes with `<Outlet />`:
  - `GuestGuard` – if you are logged in, it sends you to `/`. It wraps `/login` and `/register`.
  - `AuthGuard` – if you are not logged in, it sends you to `/login`. It wraps `/create`, `/edit/:id` and `/profile`.
- `/`, `/catalog`, `/catalog/:id` and `/contact` don't have a guard, so everyone can open them.

**Main Routes**
- 8 dynamic pages: Home, Catalog, Ad Details, Login, Register, Add Ad, Edit Ad, Profile.
- There is also a static Contact us page (`/contact`), linked in the footer. It has a placeholder email (`contact@example.com`) for questions, advertising and VIP ads, which I would like to add in the future.

**Nested & Parameterized Routes**
- Yes – `AuthGuard` and `GuestGuard` are parent routes, and their child `<Route>`s are shown through `<Outlet />`.
- Two routes have a URL parameter: `/catalog/:id` (Details) and `/edit/:id` (Edit). Both read it with `useParams()`.

### 5. List → Details Flow

**Catalog / List Page**
- The Catalog loads all ads from Firestore with `getListings()` (newest first, by `createdAt`) and shows them as `ListingCard`s in a grid. It has loading, error and "no ads" states.
- **Search by title:** there is a text field above the ads. It filters the loaded ads by title and doesn't care about upper/lower case.
- **Ad type filter:** the buttons All / Offering / Looking for filter by the `listingType` field. Every card has a small colored badge with its type, and "Looking for" ads show "Budget (€)" instead of "Price (€)".
- **Pagination:** the ads are shown 18 per page, with Prev / page numbers / Next buttons. The buttons appear only when there is more than one page. If you change the search or the filter, you go back to page 1.
- **Ad placeholders:** on wide screens (1360px and more) there are two empty 160×600 "Your ad here" boxes fixed to the left and right edge of the screen. The Home page has a similar banner. For now they are just placeholders, there are no real ads.
- There is no filter by category (Product/Service) yet. Every ad has a `category` field, but I didn't add a button for it.

**Details Page**
- You get to the Details page by clicking on a card – every `ListingCard` is a `<Link to={`/catalog/${listing.id}`}>`.
- The page takes the ad's id from the URL with `useParams()` and loads only that ad with `getListingById(id)`.
- If you are not the author, you see an "✉️ Email the author" button. It opens your email program (`mailto:`) with the author's address and a subject like "About your ad: <title>" already filled in.

### 6. Data Source & Backend

**Backend Type:** Real backend – Firebase (Backend-as-a-Service). Firebase Authentication takes care of the users and Firestore stores all the data. I don't have my own server.

### 7. Data Operations (CRUD)

The full CRUD is for the `listings` collection (the ads).

**Create (POST)**
- On the Add Ad page the user fills in a controlled form: ad type (Offering / Looking for), title, description, price in EUR, category, image URL, pet type, and then condition and brand for a product or availability for a service. These last fields change depending on the category. After the form is validated, `createListing()` calls Firestore's `addDoc()`. Together with the form data I also save `authorId`, `authorName` (the author's name), `authorEmail` (for the "Email the author" button) and a server timestamp.

**Read (GET)**
- `getListings()` loads all ads for the Catalog, and `getListingById(id)` loads one ad for the Details and Edit pages. Both use the Firestore modular SDK (`getDocs` / `getDoc`).

**Update (PUT/PATCH)**
- The Edit Ad page loads the ad and fills the form with its data, including the category fields. The form is shown only if the logged-in user is the author (`authorId`). Otherwise the page says "You are not allowed to edit this ad."
- When you save, `updateListing(id, data)` calls Firestore's `updateDoc()`. After that you go to the ad's Details page, which loads the ad again from Firestore, so you see the new data.

**Delete**
- The Delete button on the Details page is shown only to the author. `handleDelete` checks again if you are the author, asks for confirmation and then calls `deleteListing(id)` (Firestore `deleteDoc()`).
- After deleting, you go to `/catalog`, which loads the ads again, so the deleted one is gone.

### 8. Forms & Validation

**Forms Used:** Register, Login, Add Ad, Edit Ad, Add Comment.

**Validation Rules (at least three fields)**
- **Email** (Register/Login): required and `type="email"`. If the email or password is wrong, Firebase returns an error, and I show it as a readable message.
- **Name** (Register): required, trimmed, at least 2 characters ("Name must be at least 2 characters.").
- **Password** (Register): required, `minLength={6}`, and I check that both passwords are the same before sending ("Passwords do not match").
- **Price** (Add Ad/Edit Ad, in EUR): this field has more than one rule – it is required, it must be a number and it must be bigger than 0 ("Price must be a positive number").
- **Title / Description** (Add Ad/Edit Ad): required. I trim them before checking, so a title with only spaces is not accepted.

### 9. React-Specific Techniques

**Hooks & Component Lifecycle**
- I use `useState` everywhere for form fields and UI state (loading, submitting, errors).
- I use `useEffect` to load data when a page opens and when something it depends on changes. For example, the Details page has three separate effects: one loads the ad, one checks if it is in your Favorites, and one loads the comments.
- Mount/update/unmount example: on the Details page, the `useEffect` that loads the ad has an `isMounted` flag. The cleanup function sets it to `false` when the component unmounts. I did this because if the user leaves the page before Firestore answers, React should not try to update a component that is already gone. The same effect also runs again (update) when the `:id` in the URL changes, for example when you go from one ad to another.

**Context API**
- `AuthContext` / `AuthProvider` wraps the whole app (in `main.jsx`) and gives `{ user, displayName, loading, register, login, logout }` through `useAuth()`. I keep `displayName` in its own state, so the Navbar and the other pages show the new name right after registration. The context is used by the Navbar (to know which links to show), by both route guards and by the Create, Edit, Details and Profile pages (to know the user's id, name and email). This way there is one place that knows who is logged in, and I don't have to pass it down as props.

**Component Styling**
- I did the styling at the end, after everything was working. I chose warm and friendly colors (cream background, terracotta accent, soft shadows and rounded corners). The colors are CSS variables in `src/index.css` and are used everywhere. Every component and page has its own `.css` file (for example `Navbar.css`, `ListingCard.css`, and `Form.css`, which is shared by the forms) instead of one big file. The ad cards are horizontal – picture on one side, text on the other, and the whole card is one link. I got the idea from a real classifieds site. The Home page has a hero section with a gradient.

### 10. Typical User Flow

1. A visitor opens the site, looks through the Catalog without logging in and opens an ad to read the full description and the comments.
2. They register (or log in) and go to the Home page.
3. Now logged in, they post their own ad with the Add Ad form and choose if they are offering something or looking for something.
4. They search and filter the Catalog, look at other people's ads, add one to Favorites and leave a comment.
5. On the Profile page they see their own ad and the one they saved to Favorites. Later they can edit or delete their ad from its Details page.

### 11. Error & Edge Case Handling

- **Authentication errors:** Firebase error codes (for example wrong password or email already in use) are turned into readable messages with `getAuthErrorMessage(err.code)`. The message is shown on the Login/Register form, so the user doesn't see a strange error code and the app doesn't crash.
- **Network / data errors:** every Firestore read and write is in a `try/catch`. If something fails, I save the error in the state and show a message (for example "Could not load this ad." or "Could not save changes. Please try again."), so the page doesn't stay empty or stuck.
- **Empty / missing data:** the Catalog says "No ads yet. Be the first to publish one!" when there are no ads and "No ads match your search." when the search or filter finds nothing. The Details page says "This ad does not exist." if the id is wrong. The Profile page has separate messages when you have no ads and no favorites yet, and the comments section says "No comments yet." when it is empty.
