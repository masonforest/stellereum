export function Button(props) {
  return (
    <>
      <button
        type="button"
        style={{position: "relative"}}
        disabled={props.disabled || props.loading}
        onClick={props.onClick}
        className={props.className || "btn btn-primary"}
      >
          <div>
        {props.loading ? (
          <div style={{position: "absolute", color: "red", top: 10, left: 0, right: 0, marginLeft:"auto", marginRight:"auto" }} className="spinner-border spinner-border-sm text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : null}
            <span style={{visibility: props.loading ? "hidden":"visibile" }}>{props.children}</span>
          </div>
      </button>
    </>
  );
}
