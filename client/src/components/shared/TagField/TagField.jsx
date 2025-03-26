import { useState, ChangeEvent } from "react";

export const TagField = ({ tags, addTag, removeTag, maxTags }) => {
    const [userInput, setUserInput] = useState("");

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    // handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent form submission or new line creation

            if (
                userInput.trim() !== "" &&
                userInput.length <= 20 &&
                tags.length < maxTags
            ) {
                addTag(userInput);
                setUserInput(""); // Clear the input after adding a tag
            }
        }
    };

    return (
        <div className={"w-100"}>
            <div className={"flex-grow-1"}>
                <input
                    name="keyword_tags"
                    type="text"
                    placeholder={
                        tags.length < maxTags
                            ? "Add a tag"
                            : `You can only enter max. of ${maxTags} tags`
                    }
                    className="w-100 border border-gray-300 rounded-md px-4 py-2"
                    onKeyDown={handleKeyPress}
                    onChange={handleInputChange}
                    value={userInput}
                    disabled={tags.length === maxTags}
                />
            </div>
            <div className="flex flex-row flex-wrap gap-3 mt-4 text-start px-2 d-flex justify-content-evenly">
                {tags.map((tag, index) => (
                    <span
                        key={`${index}-${tag}`}
                        className="inline-flex items-start justify-start px-3 py-2 rounded-[32px] text-sm shadow-sm font-medium bg-white text-blue-800"
                    >
                        {tag}
                        <button
                            className="mx-2 hover:text-blue-500"
                            onClick={() => removeTag(tag)}
                            title={`Remove ${tag}`}
                        >
                            &times;
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};
