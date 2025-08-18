// import { FaYoutube } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';

function LinkIcons() {
    const iconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        margin: '0 8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        color: '#000',
        fontSize: '1.5rem',
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
    };

    return <div className="side-panel-icons">
        <a
            href="https://github.com/eldritchtools/limbus-mirror-dungeon-resource"
            target="_blank"
            rel="noopener noreferrer"
            style={iconStyle}
            title="GitHub Repo"
        >
            <FaGithub />
        </a>    
        {/* <a
            href="https://www.youtube.com/@EldritchPlays"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...iconStyle, color: 'red' }}
            title="YouTube"
        >
            <FaYoutube />
        </a> */}
    </div>
}

function KoFiButton() {
    return <div className="kofi-container">
        <a href='https://ko-fi.com/J3J31IBV7N' target='_blank' rel='noreferrer' >
            <img height='36' style={{ border: '0px', height: "36px" }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' />
        </a>
    </div>
}

function LinksComponent() {
    return <div style={{display: "flex", justifyContent: "center"}}>
        <LinkIcons />
        <KoFiButton />
    </div>
}

function AboutTab() {
    return (
        <div style={{width: "60%"}} className="flex justify-center p-6">
            <div className="max-w-2xl w-full shadow-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 space-y-4">
                {/* Title */}
                <h2 className="text-xl font-semibold">About this Tool</h2>

                {/* Description */}
                <p>
                    This tool was created as a reference for Limbus Company Mirror Dungeon Achievements.
                    It is designed as a free fan-made project for the community.
                    <br/><br/>
                    I create web tools for various games that will hopefully be useful to people. If you'd like
                    to support me, you can check out my ko-fi page. Thank you!
                </p>

                {/* Links */}
                <div className="border-t pt-3 flex gap-4">
                    <LinksComponent />
                </div>

                {/* Disclaimer */}
                <div className="border-t pt-3 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        This tool is a fan-made project and is not affiliated with or endorsed by Project Moon.
                        Limbus Company and all related assets are © Project Moon. All rights reserved to their respective owners.
                        The tool is free to use, and any donations go directly to supporting development of this tool and other free tools.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AboutTab;