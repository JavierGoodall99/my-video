import { staticFile } from "remotion";

export interface ProjectItem {
    id: string;
    title: string;
    category: string;
    image: string;
    link: string;
}

export const projects: ProjectItem[] = [
    {
        id: '01',
        title: 'CLOAKLY',
        category: 'APP / PRIVACY',
        image: staticFile('projects/cloakly.png'),
        link: 'https://www.getcloakly.com/'
    },
    {
        id: '02',
        title: 'NEW GEN MARKETING',
        category: 'DIGITAL MARKETING',
        image: staticFile('projects/newgenmarketing.png'),
        link: 'https://newgenmarketingzw.com/'
    },
    {
        id: '03',
        title: 'RETRO RISE',
        category: 'RETRO GAME / ARCADE',
        image: staticFile('projects/retrorise.png'),
        link: 'https://fliply-dba75.web.app/'
    },
    {
        id: '04',
        title: 'STUDIOS ELEVEN',
        category: 'AGENCY / CREATIVE',
        image: staticFile('projects/studioseleven.png'),
        link: 'https://studioeleven.vercel.app/'
    },
    {
        id: '05',
        title: 'ZENITH',
        category: 'ECOMMERCE / FASHION',
        image: staticFile('projects/zenith.png'),
        link: 'https://zenithboutique.vercel.app/'
    },
    {
        id: '06',
        title: 'RUIL MIJN WONING',
        category: 'REAL ESTATE / PLATFORM',
        image: staticFile('projects/ruilmijnwoning.png'),
        link: 'https://www.ruilmijnwoning.nl/'
    },
    {
        id: '07',
        title: 'VELORA',
        category: 'AI MARKETING / SAAS',
        image: staticFile('projects/velora.png'),
        link: 'https://messagemarketingai.vercel.app/'
    },
    {
        id: '08',
        title: 'JAVIER GOODALL',
        category: 'PORTFOLIO / PERSONAL',
        image: staticFile('projects/javiergoodallportfolio.png'),
        link: 'https://javiergoodall.vercel.app/'
    }
];
