// app/api/uploadthing/core.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const getUser = async (req: NextRequest | undefined) => {
  // If using an older version of Clerk, we may need a different approach
  try {
    if (!req) return null;
    const { userId } = getAuth(req);
    return userId ? { id: userId } : null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
};

export const ourFileRouter = {
  // Define a route for media uploads (images)
  media: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await getUser(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      
      // Return the file data to the client
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;