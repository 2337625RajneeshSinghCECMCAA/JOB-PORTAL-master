import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Bookmark } from "lucide-react";

const Job1 = ({ job }) => {
  const navigate = useNavigate();

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const diff = currentTime - createdAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl shadow-md bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-gray-500">
          {daysAgoFunction(job?.createdAt) === 0
            ? "Today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>

        <Button variant="outline" className="rounded-full" size="icon">
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>

      {/* Company Section */}
      <div className="flex items-center gap-3 my-3">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
          <AvatarImage src={job?.company?.logo} />
        </Avatar>

        <div>
          <h1
            onClick={() => navigate(`/company/${job?.company?._id}`)}
            className="font-semibold text-base sm:text-lg cursor-pointer text-blue-600 hover:underline"
          >
            {job?.company?.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            {job?.location || "India"}
          </p>
        </div>
      </div>

      {/* Job Info */}
      <div className="flex-1">
        {/* 🔴 Closed Badge */}
        {!job?.isOpen && (
          <Badge className="bg-red-500 text-white mb-2">Closed</Badge>
        )}

        <h1 className="font-bold text-lg sm:text-xl my-2 line-clamp-1">
          {job?.title}
        </h1>

        <p className="text-sm text-gray-600 line-clamp-2">{job?.description}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge
          variant="ghost"
          className="text-blue-700 font-semibold text-xs sm:text-sm"
        >
          {job?.position} Positions
        </Badge>

        <Badge
          variant="ghost"
          className="text-[#F83002] font-semibold text-xs sm:text-sm"
        >
          {job?.jobType}
        </Badge>

        <Badge
          variant="ghost"
          className="text-[#7209b7] font-semibold text-xs sm:text-sm"
        >
          {job?.salary} LPA
        </Badge>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => navigate(`/description/${job?._id}`)}
        >
          Details
        </Button>

        <Button
          className="bg-[#7209b7] w-full sm:w-auto"
          disabled={!job?.isOpen}
        >
          {job?.isOpen ? "Save For Later" : "Closed"}
        </Button>
      </div>
    </div>
  );
};

export default Job1;

// import React from "react";
// import { Button } from "../ui/button";
// import { Bookmark, BookMarked } from "lucide-react";
// import { Avatar, AvatarImage } from "../ui/avatar";
// import { Badge } from "../ui/badge";
// import { useNavigate } from "react-router-dom";

// const Job1 = ({ job }) => {
//   // Destructure properties from the job object.
//   const {
//     company,
//     title,
//     description,
//     position,
//     salary,
//     location,
//     jobType,
//     _id,
//   } = job;

//   // For bookmarking feature
//   const [isBookmarked, setIsBookmarked] = React.useState(false);

//   // Navigation hook
//   const navigate = useNavigate();
//   const daysAgo = (mongodbTime) => {
//     const createdAt = new Date(mongodbTime);
//     const currentTime = new Date();
//     const timeDiff = currentTime - createdAt;
//     return Math.floor(timeDiff / (1000 * 24 * 60 * 60));
//   };

//   return (
//     <div className="p-5 rounded-md shadow-xl bg-white border border-gray-200 cursor-pointer hover:shadow-2xl hover:shadow-blue-200 hover:p-3">
//       {/* Job time and bookmark button */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           {daysAgo(job?.createdAt) === 0
//             ? "Today"
//             : `${daysAgo(job?.createdAt)} days ago`}
//         </p>
//         <Button
//           variant="outline"
//           className="rounded-full"
//           size="icon"
//           onClick={() => setIsBookmarked(!isBookmarked)}
//         >
//           {isBookmarked ? <BookMarked /> : <Bookmark />}
//         </Button>
//       </div>

//       {/* Company info and avatar */}
//       <div className="flex items-center gap-2 my-2">
//         <Button className="p-6" variant="outline" size="icon">
//           <Avatar>
//             <AvatarImage
//               src={job?.company?.logo}
//             />
//           </Avatar>
//         </Button>
//         <div>
//           <h1 className="text-lg font-medium">{job?.company?.name}</h1>
//           <p className="text-sm text-gray-600">India</p>
//         </div>
//       </div>

//       {/* Job title, description, and job details */}
//       <div>
//         <h2 className="font-bold text-lg my-2">{title}</h2>
//         <p className="text-sm text-gray-600">{description}</p>
//         <div className="flex gap-2 items-center mt-4">
//           <Badge className="text-blue-600 font-bold" variant="ghost">
//             {position} Open Positions
//           </Badge>
//           <Badge className="text-[#FA4F09] font-bold" variant="ghost">
//             {salary} LPA
//           </Badge>
//           <Badge className="text-[#6B3AC2] font-bold" variant="ghost">
//             {location}
//           </Badge>
//           <Badge className="text-black font-bold" variant="ghost">
//             {jobType}
//           </Badge>
//         </div>
//       </div>

//       {/* Actions: Details and Save for Later */}
//       <div className="flex items-center gap-4 mt-4">
//         <Button
//           onClick={() => navigate(`/description/${_id}`)}
//           variant="outline"
//           className="font-bold rounded-sm"
//         >
//           Details
//         </Button>
//         <Button
//           variant="outline"
//           className="bg-[#6B3AC2] text-white font-bold rounded-sm"
//         >
//           Save For Later
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Job1;
