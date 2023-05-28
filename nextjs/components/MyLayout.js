import Header from './Header';

const layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD',
};

const Layout = (props) => (
  <div style={layoutStyle}>
    <Header />
    {props.children}

    <style jsx global>{`
			h1 {
				color: #125bc9;
			}
			body {
				background: #f0f2f5;
			}

			a:hover{
				color: #f0f2f5;
				background-color: #125bc9;
				border: 1px solid black:
			}
		   
			a{
				color: #125bc9;
				text-decoration: none;
				margin-right: 15px;
				padding 5px;
		   
			}
		`}</style>
  </div>
);

export default Layout;
