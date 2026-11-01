import { Avatar } from '@mantine/core';
import { MEMBERS } from '@/config/constants';
import type { MemberId } from '@/types';

interface MemberAvatarProps {
  memberId: MemberId;
  size?: number;
}

export function MemberAvatar({ memberId, size = 36 }: MemberAvatarProps) {
  const member = MEMBERS[memberId];
  return (
    <Avatar color={member.color} variant="filled" radius="xl" size={size} aria-label={member.name}>
      {member.name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
