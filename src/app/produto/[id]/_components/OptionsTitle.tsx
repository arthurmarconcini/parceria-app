interface OptionsTitleProps {
  title: string;
  description?: string;
}

const OptionsTitle = ({ title, description }: OptionsTitleProps) => {
  return (
    <div className=" px-4 py-3 md:px-0 md:py-4 rounded-t-lg md:rounded-none">
      {" "}
      <h2 className="text-base md:text-lg font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
};

export default OptionsTitle;
