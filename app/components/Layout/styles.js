import styled from 'styled-components';

export const StyledLayout = styled.div`
  padding: 0;
  margin: 0;
`;

export const Header = styled.div`
  position: static;
  padding: 24px 8px;
  background-color: ${(props) => props.theme.colors.backgroundColor};
  color: white;

  @media screen and (min-width: 768px) {
    padding: 24px;
  }

  a {
    color: white;
    text-decoration: none;

    &:visited {
      color: white;
    }
  }
`;

export const Footer = styled.footer`
  position: static;
  padding: 40px 12px;
  background-color: ${(props) => props.theme.colors.backgroundColor};
  color: white;
`;

export const LayoutContent = styled.div`
  background-image: url('https://cutewallpaper.org/21/8-bit-gif-background/wallpaper-collection-in-2019-Pixel-animation-Pixel-art-.gif');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: right center;
  color: white;
  height: 100vh;
`;
