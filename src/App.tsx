import React from "react";
import { Profile, ProjectOverview } from "./components";

const App = () => {
    return (
        <div className="w-screen h-screen bg-black flex flex-row gap-5 justify-center items-center justify-items-center 
        font-alex">
            <Profile />
            <ProjectOverview />
        </div>
    );
};

export { App };