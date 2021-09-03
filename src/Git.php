<?php

namespace Composer\Satis;

use Exception;

class Git {
    private $location = null;

    public function __construct() {

    }

    public function setDir(string $location): Git {
        $this->location = $location;

        return $this;
    }

    public function getCollaborators() {
        $resp = $this->runGitCommand("log --format='{\"name\": \"%aN\", \"email\": \"%aE\"}'  | sort |  uniq -c | sort -nr");

        $lines = explode("\n", $resp);

        $colabs = [];

        foreach ($lines as $line) {
            if ($line === "") {
                continue;
            }

            $colabs[] = json_decode("{" . explode("{", $line)[1], true);
        }

        // Remove all array items with a duplicate email
        $colabs = array_intersect_key(
            $colabs,
            array_unique(array_column($colabs, 'email'))
        );

        return $colabs;
    }

    public function runGitCommand(string $command) {
        $cmds = [];

        $cmds[] = "cd $this->location";
        $cmds[] = "git --git-dir . --work-tree . $command";

        $cmd = join(" && ", $cmds);

        return shell_exec($cmd);
    }
}