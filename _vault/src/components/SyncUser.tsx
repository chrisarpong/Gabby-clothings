import { useEffect } from "react";
import { useUser } from "@clerk/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const SyncUser = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // If Clerk is finished loading and the user is signed in
    if (isLoaded && isSignedIn && user) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      }).catch(console.error); // Catch any background errors silently
    }
  }, [user, isLoaded, isSignedIn, syncUser]);

  // This component doesn't render anything on the screen
  return null; 
};

export default SyncUser;