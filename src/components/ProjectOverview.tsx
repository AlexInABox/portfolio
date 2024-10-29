import React from 'react';
import {projectLinks} from "../constants";

export const ProjectOverview = () => {
    const styles = {
        container: "bg-black h-5/6 w-4/5 pt-1/6 my-auto mr-20 flex flex-col items-center justify-items-center",
        grid: "grid grid-cols-3 gap-4 p-4 w-full h-4/5",
        card: "bg-gray-900 rounded-lg text-white text-4xl flex justify-center items-center h-48"
    };

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {projectLinks.map((link) => (
                    <div className={styles.card}>
                        <a href={link.link} target="_blank" rel="noopener noreferrer">
                            {link.title}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};
