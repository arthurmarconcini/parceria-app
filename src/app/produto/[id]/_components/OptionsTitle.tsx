interface OptionsTitleProps {
  title: string;
  description?: string;
}

const OptionsTitle = ({ title, description }: OptionsTitleProps) => {
  return (
    <div className="bg-muted p-4">
      <h1 className="text-sm">{title}</h1>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default OptionsTitle;
