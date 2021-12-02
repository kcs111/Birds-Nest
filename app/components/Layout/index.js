import Link from 'next/link';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Footer, StyledLayout, LayoutContent } from './styles';
import { useCurrentUser } from '../../hooks';

const Layout = (props) => (
  <StyledLayout>
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">My Project</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            <Nav.Link href="/profile">Profile</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <LayoutContent>{props.children}</LayoutContent>
    <Footer>This is our Footer</Footer>
  </StyledLayout>
);

export default Layout;
