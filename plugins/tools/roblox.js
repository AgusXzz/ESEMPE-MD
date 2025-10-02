import axios from "axios";

export default {
    name: "roblox",
    category: "tools",
    command: ["roblox", "rbx"],
    run: async (conn, m, { }) => {
        const text = m.text 
        const cmd = "roblox";
        const prefix = ".";

        if (!m.text) {
            return m.reply(
                `🎮 *Roblox Profile Search*\n\n📝 Usage: ${
                    prefix + cmd
                } <username/id/url>\n💡 Example: ${
                    prefix + cmd
                } Joy\n🔗 Example: ${
                    prefix + cmd
                } https://www.roblox.com/users/9063881089/profile`
            );
        }

        try {
            m.reply(
                "🔄 Fetching Roblox profile data... This may take a moment!"
            );

            const {
                data: { PrintToTerminal: user },
            } = await axios.get(
                `https://altera-api.vercel.app/api/roblox?value=${encodeURIComponent(
                    text.trim()
                )}&key=A-CORE`
            );

            const {
                id,
                username,
                displayName,
                description,
                created,
                isBanned,
                isPremium,
                isVerified,
                status,
                presence = {},
                isOnline,
                lastLocation,
                lastOnline,
                avatarHeadshotUrl,
                avatarBustUrl,
                avatarFullUrl,
                avatar3dUrl,
                avatarAssets = [],
                avatarType,
                scales = {},
                bodyColors = {},
                emotes = [],
                currentlyWearing = [],
                outfits = [],
                previousUsernames = [],
                friendList = [],
                followerCount,
                friendsCount,
                followingCount,
                badges = [],
                gameBadges = [],
                groups = [],
                primaryGroup,
                inventory = [],
                collectibles = [],
                robux,
                games = [],
                userGames = [],
                favoriteGames = [],
                universeInfo = [],
                developedUniverses = [],
                accountAgeYears,
            } = user;

            // Enhanced status formatting
            const formatStatus = {
                premium: isPremium ? "🌟 Premium" : "💫 Standard",
                verified: isVerified ? "✅ Verified" : "❌ Not Verified",
                banned: isBanned ? "🚫 Banned" : "✅ Active",
                online:
                    isOnline === true
                        ? "🟢 Online"
                        : isOnline === false
                        ? "🔴 Offline"
                        : "⚫ Unknown",
                presence:
                    presence.userPresenceType === 0
                        ? "Offline"
                        : presence.userPresenceType === 1
                        ? "Online"
                        : presence.userPresenceType === 2
                        ? "In Game"
                        : "Unknown",
            };

            // Enhanced list formatting
            const formatList = (
                arr,
                formatter,
                maxItems = 6,
                type = "items"
            ) => {
                if (!Array.isArray(arr) || arr.length === 0) {
                    return `└─ No ${type} found\n`;
                }

                const items = arr
                    .slice(0, maxItems)
                    .map((item, i) => `└─ ${i + 1}. ${formatter(item)}`)
                    .join("\n");

                const moreText =
                    arr.length > maxItems
                        ? `└─ ... and ${arr.length - maxItems} more ${type}\n`
                        : "";

                return items + "\n" + moreText;
            };

            // Format numbers with commas
            const formatNumber = (num) =>
                num != null ? num.toLocaleString() : "0";

            // Calculate account information
            const accountInfo = created
                ? {
                      joined: new Date(created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                      }),
                      years:
                          accountAgeYears ||
                          Math.floor(
                              (new Date() - new Date(created)) /
                                  (1000 * 60 * 60 * 24 * 365)
                          ),
                  }
                : null;

            // Last online information
            const lastOnlineInfo = lastOnline
                ? `🕒 Last Online: ${new Date(lastOnline).toLocaleString()}`
                : "🕒 Last Online: Unknown";

            // Build comprehensive profile message
            let caption = `🎮 *ROBLOX PROFILE ANALYSIS* 🎮\n\n`;

            // Basic Information Section
            caption += `👤 *BASIC INFORMATION*\n`;
            caption += `├─ 🆔 User ID: ${id || "N/A"}\n`;
            caption += `├─ 📛 Display Name: ${displayName || "N/A"}\n`;
            caption += `├─ 🏷️ Username: @${username || "N/A"}\n`;
            caption += `├─ 💬 Status: ${status || "No status set"}\n`;
            if (accountInfo) {
                caption += `├─ 📅 Joined: ${accountInfo.joined}\n`;
                caption += `└─ ⏳ Account Age: ${accountInfo.years} years\n`;
            } else {
                caption += `└─ 📅 Joined: Unknown\n`;
            }
            caption += `📝 *Bio:* ${description || "No bio available"}\n\n`;

            // Account Status Section
            caption += `⚡ *ACCOUNT STATUS*\n`;
            caption += `├─ ${formatStatus.banned}\n`;
            caption += `├─ ${formatStatus.premium}\n`;
            caption += `├─ ${formatStatus.verified}\n`;
            caption += `├─ ${formatStatus.online}\n`;
            caption += `├─ 📱 Presence: ${formatStatus.presence}\n`;
            caption += `├─ 📍 Location: ${lastLocation || "Unknown"}\n`;
            caption += `├─ ${lastOnlineInfo}\n`;
            caption += `└─ 💰 Robux Balance: ${formatNumber(robux)}\n\n`;

            // Social Statistics Section
            caption += `📊 *SOCIAL STATISTICS*\n`;
            caption += `├─ 👥 Followers: ${formatNumber(followerCount)}\n`;
            caption += `├─ 🤝 Following: ${formatNumber(followingCount)}\n`;
            caption += `└─ 🫂 Friends: ${formatNumber(friendsCount)}\n\n`;

            // Avatar Information Section
            caption += `🎭 *AVATAR INFORMATION*\n`;
            caption += `├─ Type: ${avatarType || "Unknown"}\n`;
            caption += `├─ Assets: ${formatNumber(avatarAssets.length)}\n`;
            caption += `├─ Emotes: ${formatNumber(emotes.length)}\n`;
            caption += `├─ Currently Wearing: ${formatNumber(
                currentlyWearing.length
            )}\n`;
            caption += `└─ Outfits: ${formatNumber(outfits.length)}\n\n`;

            // Body Colors (if available)
            if (bodyColors && Object.keys(bodyColors).length > 0) {
                caption += `🎨 *BODY COLORS*\n`;
                Object.entries(bodyColors).forEach(([part, colorId]) => {
                    const partName = part
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());
                    caption += `├─ ${partName}: ${colorId}\n`;
                });
                caption += `\n`;
            }

            // Groups Section
            if (groups.length > 0) {
                caption += `👪 *GROUPS (${groups.length})*\n`;
                if (primaryGroup) {
                    caption += `├─ ⭐ Primary: ${primaryGroup.group.name}\n`;
                    caption += `├─ 🎯 Role: ${primaryGroup.role.name}\n`;
                }
                // Show top 3 groups by member count
                const topGroups = groups
                    .sort((a, b) => b.group.memberCount - a.group.memberCount)
                    .slice(0, 3);

                topGroups.forEach((group, index) => {
                    caption += `├─ ${index + 1}. ${group.group.name}\n`;
                    caption += `│  └─ 👥 ${formatNumber(
                        group.group.memberCount
                    )} • ${group.role.name}\n`;
                });
                if (groups.length > 3) {
                    caption += `└─ ... and ${groups.length - 3} more groups\n`;
                }
                caption += `\n`;
            }

            // Badges Section
            if (badges.length > 0 || gameBadges.length > 0) {
                caption += `🏅 *BADGES & ACHIEVEMENTS*\n`;
                caption += `├─ 🛡️ Official Badges: ${formatNumber(
                    badges.length
                )}\n`;
                caption += `└─ 🎮 Game Badges: ${formatNumber(
                    gameBadges.length
                )}\n\n`;
            }

            // Games & Creations Section
            caption += `🎯 *GAMES & CREATIONS*\n`;
            caption += `├─ 🕹️ Games Created: ${formatNumber(games.length)}\n`;
            caption += `├─ 📂 Published Games: ${formatNumber(
                userGames.length
            )}\n`;
            caption += `├─ ⭐ Favorite Games: ${formatNumber(
                favoriteGames.length
            )}\n`;
            caption += `└─ 🌐 Universes: ${formatNumber(
                universeInfo.length
            )}\n\n`;

            // Show top 3 games by visits if available
            if (games.length > 0) {
                const popularGames = games
                    .filter((game) => game.placeVisits > 0)
                    .sort((a, b) => b.placeVisits - a.placeVisits)
                    .slice(0, 3);

                if (popularGames.length > 0) {
                    caption += `🔥 *POPULAR GAMES*\n`;
                    popularGames.forEach((game, index) => {
                        caption += `├─ ${index + 1}. ${game.name}\n`;
                        caption += `│  └─ 👁️ ${formatNumber(
                            game.placeVisits
                        )} visits\n`;
                    });
                    caption += `\n`;
                }
            }

            // Friends Preview
            if (friendList.length > 0) {
                caption += `🤝 *FRIENDS PREVIEW (${formatNumber(
                    friendList.length
                )})*\n`;
                // Filter out invalid friends (like the one with id: -1)
                const validFriends = friendList
                    .filter((friend) => friend.id > 0)
                    .slice(0, 5);
                validFriends.forEach((friend, index) => {
                    const displayName =
                        friend.displayName !== friend.name
                            ? ` (${friend.displayName})`
                            : "";
                    caption += `├─ ${index + 1}. ${
                        friend.name
                    }${displayName}\n`;
                });
                if (friendList.length > 5) {
                    caption += `└─ ... and ${
                        friendList.length - 5
                    } more friends\n`;
                }
                caption += `\n`;
            }

            // Name History
            if (previousUsernames.length > 0) {
                caption += `📜 *NAME HISTORY (${previousUsernames.length})*\n`;
                previousUsernames.slice(0, 5).forEach((name, index) => {
                    caption += `├─ ${index + 1}. ${name}\n`;
                });
                if (previousUsernames.length > 5) {
                    caption += `└─ ... and ${
                        previousUsernames.length - 5
                    } more names\n`;
                }
                caption += `\n`;
            }

            // Footer
            caption += `🔍 *Profile fetched successfully!*\n`;
            caption += `💫 Powered by Roblox API • ${new Date().toLocaleString()}`;

            // Use the best available avatar image
            const avatarUrl =
                avatarHeadshotUrl ||
                avatarBustUrl ||
                avatarFullUrl ||
                avatar3dUrl;

            await m.reply(
                {
                    image: { url: avatarUrl },
                    caption: caption,
                    contextInfo: {
                        externalAdReply: {
                            title: `Roblox: ${displayName || username}`,
                            body: `@${username} • ${
                                status || "No status"
                            } • ${formatNumber(followerCount || 0)} followers`,
                            thumbnailUrl: avatarUrl,
                            sourceUrl: `https://www.roblox.com/users/${id}/profile`,
                            mediaType: 1,
                        },
                    },
                },
                { quoted: m }
            );
        } catch (error) {
            console.error("Roblox API Error:", error);

            const errorMessage = `
❌ *Failed to fetch Roblox profile*

*Possible reasons:*
• Username/ID not found
• Profile is private  
• Invalid Roblox URL
• API temporarily unavailable

*💡 Tips:*
• Use exact username (case sensitive)
• Try using numeric User ID
• Check if profile exists
• Wait a few minutes and try again

*Example:* ${prefix + cmd} builderman
            `.trim();

            m.reply(errorMessage);
        }
    },
};
