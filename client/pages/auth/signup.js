export default() =>{
  return (
    <form>
        <h1>Sign UP</h1>
        <div className="form-group">
          <label>Email Address</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control"/>
        </div>
        <buttom className = "btn btn-primary">Sign Up</buttom>
    </form>
  );
};