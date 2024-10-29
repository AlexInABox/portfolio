import pb from "../assets/profilePicture.png";
import {profileLinks} from "../constants";

export const Profile = () => {
    const styles = {
        container: "bg-black h-5/6 w-1/5 min-w-[25rem] my-auto ml-20 flex flex-col items-center",
        subcontainer: "h-5/6 w-auto min-w-88",
        picSubcontainer: "flex justify-center items-center",
        profilePic: "w-72 h-72 rounded-full border-2 border-pb_border",
        links: "w-28 h-28 rounded-full flex justify-center items-center",
        linkContainer: "flex flex-row justify-center items-center justify-items-center gap-4",
        icon: "rounded-full",
        emailme: "text-gray-300 text-xl font-medium pt-4 -rotate-12 flex justify-end justify-items-end"
    };
    return (
        <div className={styles.container}>
            <div className={styles.subcontainer}>
                <div className={styles.picSubcontainer}>
                    <img className={styles.profilePic} src={pb} alt=""/>
                </div>
                <div className="text-white text-5xl font-bold pt-2.5">AlexInABox</div>
                <div className="text-gray-400 text-4xl font-medium pt-1">Student</div>
                <div className="text-white text-3xl w-80 pt-4">
                    Hello everybody! I'm Alex, a CS Student working for the police of Berlin!
                </div>
                <div className={styles.links}>
                    <div className={styles.linkContainer}>
                        {profileLinks.map((link) => (
                            <a key={link.id} href={link.link}>
                                <img className={styles.icon} src={link.icon} alt=""/>
                            </a>
                        ))}
                    </div>
                </div>
                <div className={styles.emailme}>
                    e-mail me!
                </div>
            </div>
        </div>
    )
}
