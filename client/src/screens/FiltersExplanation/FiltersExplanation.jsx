import React from "react";
import {Table, Container} from "react-bootstrap";

export const FiltersExplanation = () => {
    return (
        <>
            <h2 className={"mb-5 mt-3 text-white"}>Site Filters Explanation</h2>
            <Container className={"mb-5"}>
                <h3 className={"mb-3 text-white"}>Simple Filtering</h3>
                <Table responsive>
                    <thead>
                    <tr>
                        <th>Priority</th>
                        <th className={"text-start"}>Type</th>
                        <th>Symbol(s)</th>
                        <th>Usages</th>
                        <th className={"text-start"}>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td className={"text-start"}>Single or Double Quotations</td>
                            <td>"" or ''</td>
                            <td>"Lou" or 'Lou'</td>
                            <td className={"text-start"}>Exact Pattern Matches on Photo Title</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td className={"text-start"}>Dash</td>
                            <td>-</td>
                            <td>-lou</td>
                            <td className={"text-start"}>Exclusion Pattern Matches on Photo Title</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td className={"text-start"}>Tilde</td>
                            <td>~</td>
                            <td>~lou</td>
                            <td className={"text-start"}>Fuzzy Pattern Matches on Photo Title & Description</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td className={"text-start"}>Website Only</td>
                            <td>site:</td>
                            <td>site:lou</td>
                            <td className={"text-start"}>Website Only Search on Photo Title</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td className={"text-start"}>Vertical Bar</td>
                            <td>|</td>
                            <td>lou | heeler | tennie</td>
                            <td className={"text-start"}>Searches All ToG Sites on Values in Photo Title or Description</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td className={"text-start"}>Two Periods</td>
                            <td>..</td>
                            <td>2007..2009</td>
                            <td className={"text-start"}>Numerical Range Search That Returns Photos based on CreatedOn TS Property of Photo</td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td className={"text-start"}>Filetype</td>
                            <td>filetype:</td>
                            <td>filetype:png</td>
                            <td className={"text-start"}>Returns All Photos of the Specified filetype</td>
                        </tr>
                    </tbody>
                </Table>
                <hr/>
                <h3 className={"mb-3 mt-5 text-white"}>Complex Filtering</h3>
                <p className={"text-white"}>Complex filtering is available and follows the priority applied as listed in the table above.</p>
                <p className={"text-white"}>The following table provides some examples of complex filtering and descriptions of their return values</p>
                <Table>
                    <thead>
                    <tr>
                        <th className={"text-start col-lg-2"}>Complex Example</th>
                        <th className={"text-start col-lg-5"}>Filter Example</th>
                        <th className={"text-start col-lg-5"}>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className={"text-start"}>1</td>
                        <td className={"text-start"}>"Lou" -vandal</td>
                        <td className={"text-start"}>Returns all photos where Lou is in the Photo Title, but has excluded any photo results where Vandal has been included in the title.</td>
                    </tr>
                    <tr>
                        <td className={"text-start"}>2</td>
                        <td className={"text-start"}>"Lou" 2022..2025 filetype:png</td>
                        <td className={"text-start"}>Returns all photos where Lou is in the Photo Title, all Photos were created between 2022 and 2025, and photos that are only PNG files.</td>
                    </tr>
                    <tr>
                        <td className={"text-start"}>3</td>
                        <td className={"text-start"}>site:lou | "blue heeler" filetype:jpg</td>
                        <td className={"text-start"}>Searches the photo album website for "Lou" as well as the other satellite Trove of Gems Sites for the term "Blue Heeler" and returns a list of resources where the filetype is a jpg file.</td>
                    </tr>
                    </tbody>
                </Table>
            </Container>
        </>
    )
}