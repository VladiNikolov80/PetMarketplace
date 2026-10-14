# PetMarketplace

A classifieds site for pet products and services, built as a React course exam project.

## Live demo

https://pet-marketplace-tawny.vercel.app/

## Tech stack

- React 19 + Vite
- React Router (client-side routing + route guards)
- Firebase Authentication (Email/Password)
- Firebase Firestore (database)

## Running the project locally

1. Clone the repository:
   ```
   git clone https://github.com/VladiNikolov80/PetMarketplace.git
   cd PetMarketplace
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open the printed local address (usually `http://localhost:5173`) in your browser.

No `.env` file or extra setup is needed — the Firebase project configuration is already included in `src/firebase.js`. Firebase config values are not secret; the security boundary is enforced by Firestore Security Rules on the backend, not by hiding the configuration.

## Project structure

```
src/
  components/      Reusable UI pieces (Navbar, Footer, ListingCard, route guards)
  contexts/         AuthContext — global authentication state
  pages/            Route-level pages (Home, Catalog, Details, Login, Register, Create, Edit, Profile)
  services/         Firestore access functions (listings, favorites, comments)
  utils/            Small helpers (Firebase error messages)
  firebase.js       Firebase app initialization
```

## Functional Guide

### 1. Project Overview

**Application Name:** PetMarketplace

**Application Category / Topic:** Classifieds / marketplace site (E-commerce-adjacent), focused on pet products and services.

**Main Purpose:** PetMarketplace lets pet owners publish listings — either a **product** (food, toys, accessories) or a **service** (walking, training, grooming) — and lets other users browse them, mark favorites, and leave comments. It solves the problem of pet owners having no simple, focused place to list and discover pet-related products and services from other individuals, instead of general classifieds sites cluttered with unrelated categories. Each ad also captures category-specific details — pet type always, plus condition/brand for products or availability for services.

### 2. User Access & Permissions

**Guest (Not Authenticated)**
- Available pages/routes: `/`, `/catalog`, `/catalog/:id`, `/login`, `/register`
- Public data shown: all published listings (title, description, price, category, image, author's email) on Catalog and Details, and existing comments on a listing's Details page

**Authenticated User**
- Main sections/pages: everything a guest sees, plus Add Ad (`/create`) and Profile (`/profile`)
- Details pages: same Listing Details page (`/catalog/:id`) as a guest sees, but with extra actions available
- Create / Edit / Delete actions: can create a new listing; can edit or delete **only** listings where they are the author (enforced both by hiding the Edit/Delete UI from non-authors and by a function-level check before the Firestore call); can add/remove a listing to their Favorites (except their own listings); can post comments on any listing

### 3. Authentication & Session Handling

**Authentication Flow**
- On app load, `AuthProvider` subscribes to Firebase's `onAuthStateChanged` listener and does not render the rest of the app until the first response arrives (`loading` state), avoiding a flash of the wrong (logged-out/logged-in) UI
- Authentication status is checked entirely through that listener — there is no manual token or flag read by the app's own code
- On successful registration, a new Firebase Auth user is created and a matching `users/{uid}` document is written to Firestore (email + createdAt); the user is then redirected to `/`
- On successful login, the user is redirected to `/`
- On logout, Firebase signs the user out, `onAuthStateChanged` fires with `null`, and the Navbar/guards immediately reflect the logged-out state

**Session Persistence**
- The session itself is persisted by the Firebase Authentication SDK (not by our own `localStorage`/cookie code); the app only ever sees it through `AuthContext`/`useAuth()`
- After a page refresh, `onAuthStateChanged` fires again on mount with the previously signed-in user (if any), so the user stays logged in automatically without needing to log in again

### 4. Routing Structure

**Route Guards Logic**
- Two guard components are implemented as layout routes using `<Outlet />`:
  - `GuestGuard` — redirects a logged-in user to `/`; otherwise renders its child routes. Wraps `/login` and `/register`.
  - `AuthGuard` — redirects a guest to `/login`; otherwise renders its child routes. Wraps `/create`, `/edit/:id` and `/profile`.
- `/`, `/catalog` and `/catalog/:id` are not wrapped by any guard and are reachable by everyone.

**Main Routes**
- 8 top-level pages: Home, Catalog, Ad Details, Login, Register, Add Ad, Edit Ad, Profile.

**Nested & Parameterized Routes**
- Yes — `AuthGuard` and `GuestGuard` are parent layout routes whose matching child `<Route>` elements render through `<Outlet />`.
- URL parameters are used on two routes: `/catalog/:id` (Details) and `/edit/:id` (Edit), both read via `useParams()`.

### 5. List → Details Flow

**Catalog / List Page**
- Displays all listings fetched from Firestore (`getListings()`, ordered by `createdAt` descending) as a grid of `ListingCard` components, with loading/error/empty states.
- Filter/sort/search by category is not implemented yet — the `category` field exists on every listing, but there is currently no UI control to filter by it.

**Details Page**
- Navigation is triggered via `<Link to={`/catalog/${listing.id}`}>` on each `ListingCard`.
- The specific listing's id is received through the URL parameter (`useParams()`) and used to fetch that one listing with `getListingById(id)`.

### 6. Data Source & Backend

**Backend Type:** Real backend — Firebase (Backend-as-a-Service). Firebase Authentication handles auth, Firestore handles all data storage. There is no custom server.

### 7. Data Operations (CRUD)

CRUD is implemented for the `listings` collection.

**Create (POST)**
- The user fills in a controlled form on the Add Ad page (title, description, price in EUR, category, image URL, pet type, plus condition/brand for a product or availability for a service, depending on the selected category). After client-side validation, `createListing()` calls Firestore's `addDoc()`, storing the data together with `authorId`, `authorName` and a server timestamp.

**Read (GET)**
- `getListings()` fetches all listings for the Catalog page; `getListingById(id)` fetches a single listing for the Details and Edit pages. Both read from Firestore through the modular SDK (`getDocs`/`getDoc`).

**Update (PUT/PATCH)**
- The Edit Ad page loads the existing listing and pre-fills the form (including the category-specific fields). It only renders the form if the current user's id matches the listing's `authorId` — otherwise it shows "You are not allowed to edit this ad." instead.
- On submit, `updateListing(id, data)` calls Firestore's `updateDoc()`. After a successful save, the user is navigated to the listing's Details page, which re-fetches the listing fresh from Firestore, so the UI reflects the change.

**Delete**
- The Delete button on the Details page is rendered only when the current user is the listing's author. `handleDelete` re-checks authorship before showing a confirmation dialog and calling `deleteListing(id)` (Firestore `deleteDoc()`).
- After a successful delete, the user is navigated to `/catalog`, whose own effect re-fetches the listings, so the deleted item disappears from the UI.

### 8. Forms & Validation

**Forms Used:** Register, Login, Add Ad, Edit Ad, Add Comment.

**Validation Rules (at least three fields)**
- **Email** (Register/Login): required, `type="email"`; invalid credentials are also caught by Firebase itself and translated into a readable message.
- **Password** (Register): required, `minLength={6}`, plus a client-side check that the repeated password matches before submitting ("Passwords do not match").
- **Price** (Add Ad/Edit Ad — multiple rules on one field, shown in EUR): required, must parse to a number, and must be greater than 0 ("Price must be a positive number").
- **Title / Description** (Create/Edit listing): required, and trimmed before the check so whitespace-only input is also rejected.

### 9. React-Specific Techniques

**Hooks & Component Lifecycle**
- `useState` is used throughout for form and UI state (loading/submitting/error flags, field values).
- `useEffect` is used for data fetching on mount and whenever its dependencies change — for example, the Details page runs three separate effects: loading the listing, checking favorite status, and loading comments.
- Mount/update/unmount example: the Details page's listing-loading effect sets an `isMounted` flag and returns a cleanup function that flips it to `false` on unmount, preventing a `setState` call after the component is gone if the user navigates away before the Firestore read resolves. The same effect also re-runs (update) whenever the `:id` URL parameter changes, e.g. navigating directly from one listing's Details page to another's.

**Context API**
- `AuthContext`/`AuthProvider` wraps the whole app (in `main.jsx`) and exposes `{ user, loading, register, login, logout }` through `useAuth()`. It is consumed by the Navbar (to decide which links to show), both route guards, and the Create/Edit/Details/Profile pages (to know the current user's id/email) — a single source of truth for "who is logged in" instead of passing it down as props.

**Component Styling**
- Implemented as a deliberately later step, once the functionality was working. A warm, friendly visual direction (cream background, terracotta accent, soft shadows/rounded corners) is defined as CSS custom properties in `src/index.css` and reused everywhere. Each component/page has its own `.css` file (e.g. `Navbar.css`, `ListingCard.css`, `Form.css` shared by the four forms) instead of one global stylesheet. The listing cards use a horizontal layout (image on one side, info on the other, the whole card is a single clickable link) inspired by a reference marketplace site, and the Home page has a gradient hero section.

### 10. Typical User Flow

1. A visitor opens the site and browses the Catalog without logging in, then opens a listing's Details page to read the full description and existing comments.
2. They register a new account (or log in) and are redirected to Home.
3. Logged in, they publish their own listing through the Create Listing form.
4. They browse other users' listings, add one they like to their Favorites, and leave a comment on it.
5. On their Profile page they see both their own published listing and the one they favorited; later they can edit or delete their own listing from its Details page.

### 11. Error & Edge Case Handling

- **Authentication errors:** Firebase auth error codes (e.g. wrong password, email already in use) are translated into readable messages via `getAuthErrorMessage(err.code)` and shown inline on the Login/Register form instead of a raw error code or a crash.
- **Network / data errors:** every Firestore read/write is wrapped in `try/catch`; a failure sets a local error state rendered as a message instead of leaving the page blank or frozen (e.g. "Could not load this ad.", "Could not save changes. Please try again.").
- **Empty / missing data states:** Catalog shows "No ads yet. Be the first to publish one!" when there are none; Details shows "This ad does not exist." if the id doesn't match any document; Profile shows separate empty messages for "no ads yet" and "no favorites yet"; the Comments section shows "No comments yet." when there are none.
