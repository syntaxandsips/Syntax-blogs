import Image from 'next/image';
import Link from 'next/link';

// Who to follow data
const profiles = [
  {
    id: 1,
    name: 'Fareed Khan',
    bio: 'I write on AI',
    link: 'https://www.linkedin.com/in/fareed-khan',
    imageUrl: '/images/profiles/fareed.jpg',
  },
  {
    id: 2,
    name: 'Level Up Coding',
    bio: 'Publication',
    description: 'Coding tutorials and news. The developer homepage.',
    link: 'https://levelup.gitconnected.com',
    imageUrl: '/images/profiles/levelup.jpg',
  },
  {
    id: 3,
    name: "Let's Code Future",
    bio: 'Sachin Maurya | Frontend Developer & Tech Writer',
    link: 'https://letscode.future.com',
    imageUrl: '/images/profiles/sachin.jpg',
  },
];

export function WhoToFollow() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Who to follow</h2>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                {/* Fallback for missing images */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {profile.name.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="font-medium">{profile.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
                {profile.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.description}</p>
                )}
              </div>
            </div>
            <button className="neo-button py-1 px-3 text-sm">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
